#!/bin/sh
FS_APP_TOKEN="IXiiwetwMizZotkC1WeczTJZn8J"     # 多维表格 App Token
FS_TABLE_ID="BkIioI" 

FS_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/964e7d57-a228-4eef-a46e-a83ddec8fd53"


# 参数: token  from  datetime  body  msg_indexes(逗号分隔)
save_to_bitable() {
    local token="$1" from="$2" dt="time: $3" body="$4" indexes="$5"

    # 转义 body 中的双引号和换行
    local body_escaped
    body_escaped=$(printf '%s' "$body" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/g' | tr -d '\n')
    body_escaped="${body_escaped%\\n}"   # 去掉末尾多余 \n

    local payload
    payload=$(cat <<EOF
{
  
  "valueRange": {
    "range": "${FS_TABLE_ID}!A:D",
    "values": [["${dt}", "${from}", "${body_escaped}", "${indexes}"]]
}
}
EOF
)
    local resp
    echo "$payload"
    resp=$(curl -s -X POST \
        "https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${FS_APP_TOKEN}/values_append" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "$payload")

    local code
    code=$(echo "$resp" | awk -F'"code":' '{print $2}' | cut -d',' -f1 | tr -d ' ')
    [ "$code" = "0" ] && return 0 || { log "写表格失败: $payload: $resp"; return 1; }
}

send_to_bot() {
    local from="$1" dt="$2" body="$3"
    local text
    text=$(printf '📩 新短信\\n发件人: %s\\n时间: %s\\n内容: %s' "$from" "$dt" "$body")
    local text_escaped
    text_escaped=$(printf '%s' "$text" | sed 's/\\/\\\\/g; s/"/\\"/g')
    echo "$text_escaped"
    resp=$( curl -s -X POST "$FS_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"${text}\"}}")
    echo "$resp"
}

token="t-g1044s0gT3NQU4GQJ26DNSMCAOYMG64MRILPLLE5"
from="13800138000"
dt="2026-04-28 10:00:00"
body_lines="Hello, world!"
idx="1"
# save_to_bitable "$token" "$from" "$dt" "$body_lines" "$idx"

# send_to_bot "$from" "$dt" "$body_lines"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── 从单条 .sms 文件提取字段 ─────────────────────────────────────────────────
field() { grep "^${1}: " "$2" | sed "s/^${1}: //"; }

process_all() {
    TMP_DIR="./sm"
    local token="t-g1044s2n7UTZ6IVYKGWKKBXVRK6VHL36UV2AZP4X"

    # 找出所有 .sms 文件，按 Reference number 分组
    # 数据结构: 用文件名 ref_<refno>_<from>.grp 存储合并状态
    local grp_dir="${TMP_DIR}/grp"
    mkdir -p "$grp_dir"

    for f in "$TMP_DIR"/*.sms; do
        [ -f "$f" ] || continue
        local idx from dt ref_no seg_cur seg_tot body_lines

        idx=$(basename "$f" .sms)
        from=$(field "From" "$f")
        dt=$(field "Date\/Time" "$f")
        ref_no=$(grep "^Reference number:" "$f" | awk '{print $3}')
        seg_cur=$(grep "^SMS segment" "$f" | awk '{print $3}')
        seg_tot=$(grep "^SMS segment" "$f" | awk '{print $5}')
        echo "$from"  "$seg_tot"
        echo "--------------------------------"
        echo "$dt"
        echo "----"
        echo "$ref_no"
        echo "----"
        echo "$seg_cur"
        echo "----"
        echo "$body_lines"
        echo "--------------------------------"
        
        # 提取正文（去掉头部元数据行）
        body_lines=$(awk '
            /^From: |^Date\/Time: |^Reference number: |^SMS segment / { next }
            { print }
        ' "$f" | sed '/^$/d')

        if [ -z "$ref_no" ]; then
            # ── 单条短信，直接处理 ───────────────────────────────────────
            log "处理单条短信 #${idx} from=${from}"
            if save_to_bitable "$token" "$from" "$dt" "$body_lines" "$idx"; then
                send_to_bot "$from" "$dt" "$body_lines"
                sms_tool -d "$DEVICE" delete "$idx" 2>/dev/null
                log "短信 #${idx} 已删除"
            fi
        else
            # ── 分段短信，写到 grp 文件 ──────────────────────────────────
            local grp_key="${from}_${ref_no}"
            local grp_file="${grp_dir}/${grp_key}.info"
            local seg_file="${grp_dir}/${grp_key}_seg${seg_cur}.txt"

            printf '%s' "$body_lines" > "$seg_file"

            # 记录 total / from / dt / idx 列表
            if [ ! -f "$grp_file" ]; then
                printf 'FROM=%s\nDT=%s\nTOTAL=%s\nIDXS=%s\n' \
                    "$from" "$dt" "$seg_tot" "$idx" > "$grp_file"
            else
                # 追加 idx
                local cur_idxs
                cur_idxs=$(grep "^IDXS=" "$grp_file" | cut -d= -f2)
                sed -i "s/^IDXS=.*/IDXS=${cur_idxs},${idx}/" "$grp_file"
            fi
        fi
    done

    # ── 处理已完整到齐的分段短信 ─────────────────────────────────────────
    for info in "${grp_dir}"/*.info; do
        [ -f "$info" ] || continue

        local grp_from grp_dt grp_total grp_idxs
        grp_from=$(grep "^FROM=" "$info" | cut -d= -f2)
        grp_dt=$(grep "^DT=" "$info"   | cut -d= -f2)
        grp_total=$(grep "^TOTAL=" "$info" | cut -d= -f2)
        grp_idxs=$(grep "^IDXS=" "$info"  | cut -d= -f2)

        local base
        base=$(basename "$info" .info)

        # 检查所有分段文件是否存在
        local seg_count=0 full_body=""
        local i=1
        local complete=1
        while [ "$i" -le "$grp_total" ]; do
            local sf="${grp_dir}/${base}_seg${i}.txt"
            if [ ! -f "$sf" ]; then
                complete=0; break
            fi
            local part; part=$(cat "$sf")
            full_body="${full_body}${part}"
            i=$((i+1))
        done

        [ "$complete" = "0" ] && continue

        log "处理合并短信 refs=${base} segs=${grp_total} from=${grp_from}"
        if save_to_bitable "$token" "$grp_from" "$grp_dt" "$full_body" "$grp_idxs"; then
            send_to_bot "$grp_from" "$grp_dt" "$full_body"
            # 逐条删除
            for idx_del in $(echo "$grp_idxs" | tr ',' ' '); do
                sms_tool -d "$DEVICE" delete "$idx_del" 2>/dev/null
                log "短信 #${idx_del} 已删除"
            done
        fi
    done
}

process_all
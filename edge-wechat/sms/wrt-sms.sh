#!/bin/sh
# sms_monitor.sh - OpenWrt SMS Monitor → 飞书表格 + 机器人
# 依赖: sms_tool, curl, awk, grep, sed

# ─── 配置区 ───────────────────────────────────────────────────────────────────
DEVICE="/dev/ttyUSB2"
POLL_INTERVAL=5                        # 轮询间隔（秒）
STATE_FILE="/tmp/sms_last_count"        # 上次短信数量缓存
TMP_DIR="/tmp/sms_proc"                 # 临时处理目录

# 飞书应用凭证（用于写表格） 
FS_APP_ID="cli_a9351adf86b8dcc2"
FS_APP_SECRET="SzATnNXfW92rEQ3u52eJsf305KJN8Frb"

# 飞书多维表格（Bitable）配置 https://scnh19a07ple.feishu.cn/wiki/IXiiwetwMizZotkC1WeczTJZn8J?sheet=BkIioI
FS_APP_TOKEN="IXiiwetwMizZotkC1WeczTJZn8J"     # 多维表格 App Token
FS_TABLE_ID="BkIioI"        # 数据表 ID

# 飞书机器人 Webhook
FS_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/964e7d57-a228-4eef-a46e-a83ddec8fd53"
# ─────────────────────────────────────────────────────────────────────────────

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── 获取飞书 tenant_access_token ─────────────────────────────────────────────
get_feishu_token() {
    local resp
    resp=$(curl -s -X POST "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
        -H "Content-Type: application/json" \
        -d "{\"app_id\":\"${FS_APP_ID}\",\"app_secret\":\"${FS_APP_SECRET}\"}")
    echo "$resp" | awk -F'"tenant_access_token":"' '{print $2}' | cut -d'"' -f1
}

# ── 写入飞书多维表格（Bitable）一行 ─────────────────────────────────────────
# 参数: token  from  datetime  body  msg_indexes(逗号分隔)
save_to_bitable() {
    local token="$1" from="$2" dt="$3 " body="$4" indexes="$5"

    # 转义 body 中的双引号和换行
    local body_escaped
    body_escaped=$(printf '%s' "$body" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/g' | tr -d '\n')
    body_escaped="${body_escaped%\\n}"   # 去掉末尾多余 \n

    local payload
    payload=$(cat <<EOF
{
    "valueRange": {
        "range": "${FS_TABLE_ID}!A:D",
        "values": [["${dt} ", "${from}", "${body_escaped}", "${indexes}"]]
    }
}
EOF
)
    local resp
    resp=$(curl -s -X POST \
        "https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${FS_APP_TOKEN}/values_append" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "$payload")

    local code
    code=$(echo "$resp" | awk -F'"code":' '{print $2}' | cut -d',' -f1 | tr -d ' ')
    [ "$code" = "0" ] && return 0 || { log "写表格失败: $payload: $resp"; return 1; }
}

# ── 推送飞书机器人 ────────────────────────────────────────────────────────────
send_to_bot() {
    local from="$1" dt="$2 " body="$3"
    local text
    text=$(printf '📩 新短信\\n发件人: %s\\n时间: %s\\n内容: %s' "$from" "$dt" "$body")
    
    resp=$(curl -s -X POST "$FS_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"${text}\"}}" \
        )
    local code
    code=$(echo "$resp" | awk -F'"code":' '{print $2}' | cut -d',' -f1 | tr -d ' ')
    [ "$code" = "0" ] && return 0 || { log "推送飞书机器人失败: $text: $resp"; return 1; }
}

# ── 获取当前短信总数 ──────────────────────────────────────────────────────────
get_sms_count() {
    sms_tool -d "$DEVICE" status 2>/dev/null \
        | awk -F'used: ' '{print $2}' | cut -d',' -f1 | tr -d ' \n'
}

# ── 解析 recv 输出，每条短信写到 $TMP_DIR/<index>.sms ────────────────────────
parse_recv_output() {
    local raw="$1"
    mkdir -p "$TMP_DIR"

    # 用 awk 分割每条 MSG
    echo "$raw" | awk '
    /^MSG: [0-9]+/ {
        if (idx != "") { print body > (dir "/" idx ".sms") }
        idx = $2
        body = ""
        next
    }
    /^No response from modem/ { next }
    {
        body = body $0 "\n"
    }
    END {
        if (idx != "") { print body > (dir "/" idx ".sms") }
    }
    ' dir="$TMP_DIR"
}

# ── 从单条 .sms 文件提取字段 ─────────────────────────────────────────────────
field() { grep "^${1}: " "$2" | sed "s/^${1}: //"; }

# ── 主处理：合并分段短信，上传，删除 ────────────────────────────────────────
process_all() {
    local token="$1"

    # 收取所有短信
    local raw
    raw=$(sms_tool -d "$DEVICE" recv 2>/dev/null)
    [ -z "$raw" ] && return

    rm -rf "$TMP_DIR" && mkdir -p "$TMP_DIR"
    parse_recv_output "$raw"

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

# ── 主循环 ───────────────────────────────────────────────────────────────────
log "=== SMS Monitor 启动，设备: $DEVICE，间隔: ${POLL_INTERVAL}s ==="

while true; do
    current=$(get_sms_count)

    if [ -z "$current" ]; then
        log "无法获取短信状态（modem 未就绪？）"
        sleep "$POLL_INTERVAL"
        continue
    fi

    last=$(cat "$STATE_FILE" 2>/dev/null || echo "0")

    if [ "$current" != "$last" ] && [ "$current" -gt 0 ]; then
        log "短信数量变化: ${last} → ${current}，开始处理..."
        token=$(get_feishu_token)
        if [ -z "$token" ]; then
            log "获取飞书 Token 失败，跳过本轮"
        else
            process_all "$token"
            # 处理后重新读取数量（删除后会变少）
            current=$(get_sms_count)
        fi
        printf '%s' "$current" > "$STATE_FILE"
    fi

    sleep "$POLL_INTERVAL"
done
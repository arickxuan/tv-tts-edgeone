#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
处理JSON数据，去除用户名、密码、URIs相同的重复项
"""

import json
import sys
from pathlib import Path


def normalize_uris(uris):
    """标准化URIs列表，用于比较"""
    if not uris:
        return tuple()
    return tuple(sorted([uri.get('uri', '') for uri in uris]))


def get_login_key(item):
    """
    生成登录信息的唯一键
    基于username、password和uris
    """
    if 'login' not in item:
        return None
    
    login = item['login']
    username = login.get('username', '')
    password = login.get('password', '')
    uris = normalize_uris(login.get('uris', []))
    
    return (username, password, uris)


def remove_duplicates(data):
    """
    去除重复的登录信息
    保留每组重复项中的第一个
    """
    seen = set()
    unique_items = []
    
    items = data.get('items', [])
    duplicates_count = 0
    
    for item in items:
        # 获取登录信息的唯一键
        login_key = get_login_key(item)
        
        if login_key is None:
            # 没有登录信息，保留该项
            unique_items.append(item)
            continue
        
        if login_key not in seen:
            seen.add(login_key)
            unique_items.append(item)
        else:
            duplicates_count += 1
            print(f"发现重复项: {item.get('name', 'Unknown')} - 用户名: {item['login'].get('username', 'N/A')}")
    
    data['items'] = unique_items
    
    print(f"\n处理完成:")
    print(f"  原始项目数: {len(items)}")
    print(f"  重复项数: {duplicates_count}")
    print(f"  保留项数: {len(unique_items)}")
    
    return data


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python remove_duplicates.py <输入文件.json> [输出文件.json]")
        print("\n如果不指定输出文件，将使用 <输入文件>_unique.json")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    
    if not input_file.exists():
        print(f"错误: 输入文件 '{input_file}' 不存在")
        sys.exit(1)
    
    # 确定输出文件名
    if len(sys.argv) >= 3:
        output_file = Path(sys.argv[2])
    else:
        output_file = input_file.parent / f"{input_file.stem}_unique{input_file.suffix}"
    
    print(f"正在读取文件: {input_file}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"错误: 无法解析JSON文件 - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"错误: 读取文件失败 - {e}")
        sys.exit(1)
    
    # 去除重复项
    print("\n正在处理数据...")
    cleaned_data = remove_duplicates(data)
    
    # 保存结果
    print(f"\n正在保存到: {output_file}")
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
        print(f"✓ 成功保存到 {output_file}")
    except Exception as e:
        print(f"错误: 保存文件失败 - {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

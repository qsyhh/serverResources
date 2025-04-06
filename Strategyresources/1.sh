#!/bin/bash

# 获取远程仓库的最新信息
git fetch

# 一次 find 操作，同时处理文件和文件夹
find . \( -type f -o -type d \) | while read -r path; do
    if [ -f "$path" ]; then
        # 处理文件
        remote_time=$(git log -1 --format="%ai" -- "$path")
        if [ -n "$remote_time" ]; then
            remote_timestamp=$(date -d "$remote_time" +%s)
            touch -d "@$remote_timestamp" "$path"
        fi
    elif [ -d "$path" ]; then
        # 处理文件夹
        latest_file=$(find "$path" -type f -printf '%T+ %p\n' 2>/dev/null | sort -r | head -n 1 | awk '{print $2}')
        if [ -n "$latest_file" ]; then
            latest_time=$(stat -c %y "$latest_file")
            touch -d "$latest_time" "$path"
        fi
    fi
done

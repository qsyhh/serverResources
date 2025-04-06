#!/bin/bash

# 获取远程仓库的最新信息
git fetch

# 遍历本地仓库中的所有文件
find . -type f | while read -r file; do
    # 获取远程仓库中对应文件的最后提交时间
    remote_time=$(git log -1 --format="%ai" -- "$file")
    
    # 将远程时间转换为时间戳
    remote_timestamp=$(date -d "$remote_time" +%s)
    
    # 修改本地文件的最后修改时间为远程时间
    touch -d "@$remote_timestamp" "$file"
done

# 遍历本地仓库中的所有文件夹
find . -type d | while read -r dir; do
    # 获取文件夹内最后修改时间最迟的文件的时间
    latest_file=$(find "$dir" -type f -printf '%T+ %p\n' | sort -r | head -n 1 | awk '{print $2}')
    
    if [ -n "$latest_file" ]; then
        # 获取该文件的最后修改时间
        latest_time=$(stat -c %y "$latest_file")
        
        # 将文件夹的最后修改时间设置为该文件的时间
        touch -d "$latest_time" "$dir"
    fi
done
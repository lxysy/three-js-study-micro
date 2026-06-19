#!/bin/bash

# 检查当前目录下是否存在package-lock.json文件
if [ ! -f package-lock.json ]; then
  echo "package-lock.json在当前目录中未找到"
  exit 1
fi

# 如果tarballs目录不存在，则创建它
mkdir -p tarballs

# 从package-lock.json文件中提取resolved字段
while read -r line; do
  if [[ $line =~ "resolved" ]]; then
    # 提取tarballs链接
    link=$(echo "$line" | cut -d '"' -f 4)
    # 检查链接是否已经下载过
    if [ ! -e "tarballs/$(basename "$link")" ]; then
      # 下载tarballs
      wget "$link" -P tarballs
    fi
  fi
done < package-lock.json

# 压缩tarballs目录
tar -czf tarballs.tar.gz tarballs

echo "tarballs文件已下载到tarballs目录中，并压缩成tarballs.tar.gz"


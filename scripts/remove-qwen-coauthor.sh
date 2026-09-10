#!/bin/sh

set -eu

trailer='Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>'
message=$(git log -1 --format='%B')
clean_message=$(printf '%s\n' "$message" | sed "/^$trailer\$/d")

if [ "$message" = "$clean_message" ]; then
  printf '%s\n' 'The latest commit does not contain the Qwen co-author trailer.'
  exit 0
fi

printf '%s\n' "$clean_message" | git commit --amend -F -
printf '%s\n' 'Removed the Qwen co-author trailer from the latest local commit.'

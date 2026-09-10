# Agent Behavior

Read SPEC.md and TODO.md only when needed for the current task.

## Task execution

ONE checkbox in TODO.md = ONE task.

Never combine multiple unchecked TODO items.

- Read only files relevant to the current task.
- Do not analyze the entire repository unless explicitly requested.
- Do not perform unrelated cleanup.
- Do not narrate long reasoning.
- Use tools as soon as enough information is available.
- Keep changes small and focused.
- Never continue automatically to the next checkbox.
- After any context compression, re-read the exact file/range immediately before editing it.
- Do not perform other tool calls between that read and the edit.
- When updating TODO.md after compression, read only the required range and edit it immediately.

## Git commits

Never add `Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>` to commit messages.

Qwen must never create, amend, or push Git commits. Make the requested code changes, stage them with `git add`, and report the staged files together with a proposed commit message. The user must review and run `git commit` themselves. Do not run `git commit`, `git commit --amend`, `git push`, or any force-push command, even when asked to finish the task.

If an existing commit contains the unwanted trailer, tell the user they can run `scripts/remove-qwen-coauthor.sh` to remove it from the latest local commit. Qwen must not invoke this script because it amends history. Any history rewrite must be reported clearly.

## Completion

After the task:

1. Run relevant verification.
2. Fix failures introduced by the task.
3. Update TODO.md.
4. Summarize in no more than 5 bullets.
5. Stop.

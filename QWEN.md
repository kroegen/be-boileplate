# Agent Behavior

Read SPEC.md and TODO.md before modernization work.

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

## Git commits

Never add `Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>` to commit messages.

## Completion

After the task:

1. Run relevant verification.
2. Fix failures introduced by the task.
3. Update TODO.md.
4. Summarize in no more than 5 bullets.
5. Stop.

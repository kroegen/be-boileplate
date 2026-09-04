# Agent Behavior

## Task execution rule

ONE checkbox in TODO.md = ONE task.

Never combine multiple unchecked TODO items, even if they are related.

If the current checkbox requires investigation:
- investigate only what is necessary for that checkbox,
- record the result,
- mark that checkbox,
- stop.

Never continue to the next checkbox automatically.

## Working rules

- Read only files relevant to the current task.
- Do not analyze the whole repository unless explicitly asked.
- Do not re-read files already inspected unless necessary.
- Do not perform unrelated cleanup.
- Do not narrate reasoning.
- Do not produce long plans.
- Use tools as soon as enough information is available.
- Prefer small, focused changes.
- Keep responses concise.

## Completion

After making changes:

1. Run only verification relevant to the current task.
2. Fix failures caused by the current change.
3. Update TODO.md.
4. Summarize changes in no more than 5 short bullets.
5. Stop.

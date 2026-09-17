## Verification and review

Do not run tests or perform a separate self-review.

Testing and review are handled by the `reviewer` subagent.

After implementing requested work:

1. Do not run tests yourself.
2. Do not perform a self-review.
3. Do not mark TODO checkbox(es) complete yet.
4. Call the `agent` tool with:
   - `subagent_type: "reviewer"`
   - `run_in_background: false`
5. Wait for the reviewer result inline.
6. Do not call `list_agents` while waiting.

If the reviewer returns `ISSUES:`:

1. Verify each reported issue against the repository.
2. Fix only valid issues.
3. Do not run tests yourself.
4. Start a NEW foreground `reviewer` run using `run_in_background: false`.
5. Repeat until the reviewer returns `PASS`.
6. Maximum 3 review/fix cycles.

If issues remain after 3 review cycles, stop and report them to the user.

If the reviewer returns `PASS`:

1. Mark the reviewed TODO checkbox(es) complete.
2. Make no additional implementation changes.
3. Give the final implementation summary in no more than 5 bullets.
4. Stop.

Do not ask the user whether to fix reviewer findings.

Do not say that the reviewer will review the changes and then stop. Actually call the reviewer.

Do not poll `list_agents`.

If the reviewer cannot start or returns a technical error, stop and report the error.

## Scout workflow

When the user asks to work on the next TODO:

1. If a completed scout result for the next TODO is already available, use it.
2. Otherwise call the `scout` subagent and wait for its result.
3. Immediately implement the returned task.
4. Do not ask the user for confirmation.
5. Continue automatically into the reviewer workflow.

While implementing the current TODO, once the current task is known:

1. Start the `scout` subagent in the background to prepare the TODO after the current one.
2. Explicitly tell the scout which current TODO to exclude.
3. Continue implementing the current task immediately.
4. Do not poll `list_agents`.
5. Let the scout completion notification arrive asynchronously.

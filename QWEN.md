## Verification and review

The main agent is responsible for implementation and testing.

The `reviewer` subagent performs read-only code review only.

After implementing requested work:

1. Run the relevant tests yourself.
2. Fix any test failures before requesting review.
3. Do not perform a separate self-review.
4. Do not mark TODO checkbox(es) complete yet.
5. Call the `agent` tool with:
   - `subagent_type: "reviewer"`
   - `run_in_background: false`
6. Wait for the reviewer result inline.
7. Do not call `list_agents` while waiting.

If the reviewer returns `ISSUES:`:

1. Verify each reported issue against the repository.
2. Fix only valid issues.
3. Run the relevant tests again.
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

If the reviewer:
- cannot start
- returns a technical error
- reaches its turn limit
- returns no result

then stop and report the reviewer failure.

Do not automatically retry a failed reviewer invocation.

## Scout workflow

When the user asks to work on the next TODO:

1. If a completed scout result for the next TODO is already available, use it.
2. Otherwise call the `scout` subagent and wait for its result.
3. Immediately implement the returned task.
4. Do not ask the user for confirmation.
5. Continue automatically into the verification and review workflow.

While implementing the current TODO, once the current task is known:

1. Start the `scout` subagent in the background to prepare the TODO after the current one.
2. Explicitly tell the scout which current TODO to exclude.
3. Continue implementing the current task immediately.
4. Do not poll `list_agents`.
5. Let the scout completion notification arrive asynchronously.
6. Do not act on the scout result until the current TODO has passed reviewer validation.
7. After the current TODO passes review, use the completed scout result for the next TODO instead of launching another scout.

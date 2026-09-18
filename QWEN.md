## Verification and review

The main agent is responsible for implementation and testing.

The `reviewer` subagent performs read-only code review only.

After implementing requested work:

1. Run the relevant tests yourself.
2. Fix any test failures before requesting review.
3. Do not perform a separate self-review.
4. Do not mark TODO checkbox(es) complete yet.
5. Prepare the review material:
   - run `git status --short`
   - run `git diff --unified=10`
   - identify all files changed for the current TODO
   - if the current TODO created new untracked files, include their contents in the review material because normal `git diff` does not include them
6. Call the `agent` tool with:
   - `subagent_type: "reviewer"`
   - `run_in_background: false`
7. In the reviewer prompt, provide:
   - the exact TODO being reviewed
   - the relevant test result summary
   - `git status --short`
   - the complete `git diff --unified=10` for the current implementation
   - contents of any new untracked files created for the current TODO
8. Wait for the reviewer result inline.
9. Do not call `list_agents` while waiting.

The reviewer should review the supplied diff first.

Do not ask the reviewer to rediscover the implementation changes from the repository.

If the reviewer returns `ISSUES:`:

1. Verify each reported issue against the repository.
2. Fix only valid issues.
3. Run the relevant tests again.
4. Prepare a fresh `git status --short` and `git diff --unified=10`.
5. Include contents of any new untracked files created for the current TODO.
6. Start a NEW foreground `reviewer` run using:
   - `subagent_type: "reviewer"`
   - `run_in_background: false`
7. Give the new reviewer the updated diff and test result.
8. Repeat until the reviewer returns `PASS`.
9. Maximum 3 review/fix cycles.

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

1. If a completed scout result for the current TODO is already available, use it.
2. Otherwise call the `scout` subagent in the foreground:
   - `subagent_type: "scout"`
   - `run_in_background: false`
3. Wait for the scout result.
4. Identify the exact current TODO from the scout result.
5. BEFORE reading implementation files, editing files, installing packages, or making any implementation changes, immediately start a NEW `scout` subagent in the background for the TODO after the current one:
   - `subagent_type: "scout"`
   - `run_in_background: true`
6. Explicitly tell the background scout:
   - the exact current TODO is already claimed
   - it MUST skip that TODO
   - it must find and plan the next incomplete TODO after it
   - it must not implement anything
7. Do not wait for the background scout.
8. Immediately begin implementing the current TODO.
9. Do not ask the user for confirmation.
10. Continue automatically into the verification and review workflow.

The background scout MUST be launched before implementation of the current TODO begins.

Do not postpone launching the background scout until after edits, tests, or review.

Do not launch more than one background scout for the same next TODO.

Do not poll `list_agents`.

Let the background scout completion notification arrive asynchronously.

When the background scout finishes:

1. Retain its completed result as the prepared plan for the next TODO.
2. Do not act on that result while the current TODO is still being implemented or reviewed.
3. Finish the current TODO completely through reviewer `PASS`.
4. After the current TODO passes review, the completed background scout result becomes the plan for the next TODO.
5. Do not launch another foreground scout for that next TODO if a valid completed background scout result already exists.

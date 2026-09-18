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
   - if the current TODO created new untracked files, include their contents because normal `git diff` does not include them
6. Call the `agent` tool with:
   - `subagent_type: "reviewer"`
   - `run_in_background: false`
7. In the reviewer prompt, provide:
   - the exact TODO being reviewed
   - the relevant test result summary
   - `git status --short`
   - the complete `git diff --unified=10`
   - contents of any new untracked files created for the current TODO
8. Wait for the reviewer result inline.
9. Do not call `list_agents` while waiting.

The reviewer should review the supplied diff first.

Do not ask the reviewer to rediscover implementation changes from the repository.

If the reviewer returns `ISSUES:`:

1. Verify each reported issue against the repository.
2. Fix only valid issues.
3. Run the relevant tests again.
4. Prepare fresh review material:
   - `git status --short`
   - `git diff --unified=10`
   - contents of new untracked files when applicable
5. Start a NEW foreground `reviewer` run using:
   - `subagent_type: "reviewer"`
   - `run_in_background: false`
6. Give the reviewer the updated diff and test result.
7. Repeat until the reviewer returns `PASS`.
8. Maximum 3 review/fix cycles.

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

## TODO selection

The main agent, NOT the scout, is responsible for selecting TODO tasks.

`TODO.md` contains:
1. the active TODO checklist at the top
2. historical audit/baseline notes beginning at `## Phase 0 Audit Notes`

Only TODO checkboxes before `## Phase 0 Audit Notes` are active tasks.

When the user asks to work on the next TODO:

1. Use `grep_search` on `TODO.md` for incomplete checkboxes matching `- [ ]`.
2. Select the first incomplete checkbox in file order before `## Phase 0 Audit Notes`.
3. Do not ask the scout to discover which TODO is next.
4. Do not read or paginate through TODO.md to discover tasks.
5. Read only a small surrounding TODO range if the checkbox text itself is insufficient.
6. Record:
   - exact TODO text
   - TODO.md line number

TODO selection is deterministic bookkeeping. Do it directly and cheaply.

## Scout workflow

The `scout` is a task planner, not a TODO finder.

After the main agent selects the current TODO:

1. If a completed scout result already exists for that exact TODO, use it.
2. Otherwise call the `scout` subagent in the foreground:
   - `subagent_type: "scout"`
   - `run_in_background: false`
3. Pass the scout:
   - the exact TODO text
   - the TODO.md line number
   - an explicit instruction to plan ONLY that task
   - an explicit instruction NOT to search TODO.md for another task
4. Wait for the scout result.
5. Treat the returned result as the implementation plan for the current TODO.

Before implementing the current TODO:

1. Determine the next incomplete TODO after the current TODO using `grep_search` on `TODO.md`.
2. Do not ask a scout to discover the next TODO.
3. Record the next TODO's:
   - exact TODO text
   - TODO.md line number
4. If another incomplete TODO exists, immediately start a NEW `scout` subagent in the background:
   - `subagent_type: "scout"`
   - `run_in_background: true`
5. Pass that background scout:
   - the exact next TODO text
   - the TODO.md line number
   - an explicit instruction to plan ONLY that task
   - an explicit instruction NOT to search TODO.md for another task
   - an explicit instruction NOT to implement anything
6. Do not wait for the background scout.
7. Immediately begin implementing the current TODO.

The background scout MUST be launched before:
- editing implementation files
- installing packages
- running implementation commands
- making implementation changes

Do not launch more than one background scout for the same TODO.

Do not poll `list_agents`.

Let the background scout completion notification arrive asynchronously.

When the background scout finishes:

1. Retain its completed result as the prepared plan for that exact TODO.
2. Do not act on it while the current TODO is still being implemented or reviewed.
3. Finish the current TODO completely through reviewer `PASS`.
4. When that prepared TODO becomes the current TODO, use the retained scout result directly.
5. Do not launch another foreground scout for a TODO that already has a valid completed scout result.

## Implementation handoff

After receiving the scout plan for the current TODO:

1. Verify actual repository paths and current code before editing.
2. Do not blindly trust guessed file paths from the scout.
3. Implement the current TODO.
4. Run the relevant tests.
5. Continue automatically into the verification and review workflow.
6. Do not ask the user for confirmation before implementation.

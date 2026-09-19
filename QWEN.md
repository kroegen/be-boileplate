## Verification and review

The main agent is responsible for implementation and testing.

The `reviewer` subagent performs read-only review of a prepared review handoff file only.

Work on exactly ONE TODO checkbox per user request.

Do not implement the following TODO in the same run, even if it is adjacent, related, or in the same phase.

After implementing the current TODO:

1. Run the relevant tests yourself.
2. Fix any test failures before requesting review.
3. Do not perform a separate self-review.
4. Do not mark the TODO checkbox complete yet.
5. Prepare fresh review material:
   - run `git status --short`
   - run `git diff --unified=10`
   - identify all files changed for the current TODO
   - include contents of new untracked files created for the current TODO because normal `git diff` does not include them
6. Write the complete review package to a fresh reviewer handoff file defined below.
7. Call the `reviewer` subagent in the foreground.
8. Wait for the reviewer result inline.
9. Do not call `list_agents` while waiting.

Do not ask the reviewer to rediscover implementation changes from the repository.

### Reviewer handoff file

Use a fresh file for every reviewer invocation:

`/tmp/qwen-code-handoff/<repository-name>/reviewer-context-<TODO-line>-<review-cycle>.md`

Examples:

- `/tmp/qwen-code-handoff/be-boileplate/reviewer-context-127-1.md`
- `/tmp/qwen-code-handoff/be-boileplate/reviewer-context-127-2.md`

Create the parent directory if necessary.

`<review-cycle>` starts at `1` for the first review of the current TODO and increments for every new reviewer invocation.

Never overwrite or reuse a reviewer handoff file within the same TODO workflow.

If a candidate path already exists from an earlier session, use the next unused numeric suffix instead of overwriting it.

The file must contain exactly these sections:

```md
# TODO
TODO.md line: <line number>

<exact TODO being reviewed>

# TEST RESULTS
<commands run and concise results>

# GIT STATUS
```text
<git status --short>
```

# GIT DIFF
```diff
<complete git diff --unified=10>
```

# NEW UNTRACKED FILES
## <path>
```text
<complete contents>
```
```

If there are no new untracked files, write:

`None.`

When calling the reviewer, provide only:
- the exact TODO text
- the TODO.md line number
- the absolute reviewer handoff file path
- an instruction to read that file and return `PASS` or `ISSUES`

### Reviewer result validity

A reviewer result is valid only for the exact implementation state supplied to that reviewer invocation.

Any implementation change after a reviewer result invalidates that result.

Only the result from the most recent reviewer invocation may authorize TODO completion.

Never reuse an earlier `PASS` after:
- changing implementation files
- changing tests
- changing configuration
- changing the handoff diff
- a later reviewer invocation fails, is cancelled, reaches `MAX_TURNS`, or returns no result

If the reviewer returns `ISSUES:`:

1. Verify each reported issue against the repository.
2. Fix only valid issues.
3. Run the relevant tests again.
4. Prepare fresh status, diff, test results, and untracked-file contents.
5. Write them to a NEW reviewer handoff file using the next review-cycle number.
6. Start a NEW foreground reviewer run using that new file.
7. Repeat until the most recent reviewer returns `PASS`.
8. Maximum 3 review/fix cycles.

If issues remain after 3 review/fix cycles, stop and report them to the user.

If the most recent reviewer returns `PASS`:

1. Mark ONLY the reviewed TODO checkbox complete.
2. Make no additional implementation changes.
3. Give the final implementation summary in no more than 5 bullets.
4. Stop.

Do not implement the next TODO after `PASS`.

Do not ask the user whether to fix reviewer findings.
Do not say that the reviewer will review the changes and then stop. Actually call the reviewer.
Do not poll `list_agents`.

If the most recent reviewer:
- cannot start
- returns a technical error
- is cancelled
- reaches its turn limit
- returns no result

then:
1. Do not reuse any earlier reviewer result.
2. Do not mark the TODO complete.
3. Stop and report the reviewer failure.

Do not automatically retry a technically failed reviewer invocation.

## TODO selection

The main agent, NOT the scout, is responsible for selecting TODO tasks.

`TODO.md` contains:
1. the active TODO checklist at the top
2. historical audit/baseline notes beginning at `## Phase 0 Audit Notes`

Only TODO checkboxes before `## Phase 0 Audit Notes` are active tasks.

When the user asks to work on the next TODO:

1. Use `grep_search` on `TODO.md` for incomplete checkboxes matching `- [ ]`.
2. Select the first incomplete checkbox in file order before `## Phase 0 Audit Notes`.
3. Select exactly ONE TODO.
4. Do not ask the scout to discover which TODO is next.
5. Do not read or paginate through TODO.md to discover tasks.
6. Read only a small surrounding TODO range if the checkbox text itself is insufficient.
7. Record:
   - exact TODO text
   - TODO.md line number
8. Do not implement, plan, or modify files for any later TODO in the same run.

TODO selection is deterministic bookkeeping. Do it directly.

## Scout workflow

The scout does NOT explore the repository independently.

The main agent gathers repository context and writes a compact handoff file. The scout reads only that file and synthesizes a plan.

Running the scout for the current TODO is mandatory.

Do not edit implementation files for the current TODO until:
1. the scout handoff file has been prepared
2. the scout has been called
3. the scout has returned a plan

### Scout handoff file

Use a fresh scout handoff file:

`/tmp/qwen-code-handoff/<repository-name>/scout-context-<TODO-line>-<attempt>.md`

Examples:

- `/tmp/qwen-code-handoff/be-boileplate/scout-context-127-1.md`
- `/tmp/qwen-code-handoff/be-boileplate/scout-context-127-2.md`

Create the parent directory if necessary.

`<attempt>` starts at `1`.

Never overwrite or reuse a scout handoff file within the same TODO workflow.

If a candidate path already exists from an earlier session, use the next unused numeric suffix instead of overwriting it.

The handoff file must contain exactly these sections:

```md
# TODO
TODO.md line: <line number>

<exact TODO text>

# CURRENT STRUCTURE
- <relevant file or module> — <short factual description>
- <relevant file or module> — <short factual description>

# RELEVANT SYMBOLS
- <symbol> — <file> — <short role>
- <symbol> — <file> — <short role>

# RELEVANT CODE
## <file>
```text
<small directly relevant snippet>
```

# TESTS / CONTRACTS
- <existing test or behavior that must be preserved>

# KNOWN CONSTRAINTS
- <constraint visible from the repository or TODO>

# QUESTIONS FOR SCOUT
Produce:
1. recommended implementation direction
2. affected files
3. order of work
4. important risks
5. acceptance checks
6. anything the main agent must verify before editing
```

### How main prepares scout context

The main agent must gather this context itself.

Do not delegate context gathering to `Explore`, another scout, or another subagent.

Use targeted repository tools directly:
- prefer `grep_search`
- use `glob` only when file locations are unknown
- use `read_file` for the smallest useful ranges

Do not make the handoff exhaustive.

The purpose is to provide enough grounded context for planning, not to copy the repository into a markdown file.

Target roughly 2,000-6,000 tokens.
Do not exceed roughly 8,000 tokens unless the task genuinely cannot be represented more compactly.

Prefer:
- file names
- symbols
- relationships
- short relevant snippets
- tests/contracts

Avoid:
- whole large files
- unrelated implementation details
- historical TODO notes
- duplicate snippets

### Calling scout

After writing the scout handoff file:

1. Call the `scout` subagent in the foreground.
2. Pass:
   - the exact TODO text
   - the TODO.md line number
   - the absolute scout handoff file path
3. Tell the scout to read ONLY that handoff file.
4. Tell the scout not to inspect the repository or TODO.md.
5. Tell the scout not to implement anything.
6. Wait for the scout result before editing implementation files.

The scout result is advisory. The main agent owns implementation decisions.

If the scout reports `NEEDS_CONTEXT`:

1. Inspect only the specifically requested missing information.
2. Create a NEW scout handoff file using the next attempt number.
3. Include the previous useful context plus the requested missing context.
4. Run ONE new scout invocation using that new file.

Do not allow an open-ended scout exploration loop.
Do not launch a fresh scout merely to retrieve a previous scout result.
Do not ask a scout to rediscover a task it already analyzed.

If the scout fails technically, reaches its turn limit, is cancelled, or returns no usable result:
1. Stop the scout workflow.
2. Do not silently replace the scout with `Explore`.
3. Do not silently continue implementation as though scout planning succeeded.
4. Report the scout failure.

## Implementation handoff

After receiving the scout plan for the current TODO:

1. Verify actual repository paths and current code before editing.
2. Do not blindly trust guessed file paths or conclusions from the scout.
3. Implement ONLY the current TODO.
4. Run the relevant tests.
5. Continue automatically into the verification and review workflow.
6. Do not ask the user for confirmation before implementation.
7. Do not begin the next TODO in the same run.

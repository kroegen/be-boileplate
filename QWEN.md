## Verification and review

Do not run tests or perform a separate self-review.

Testing and review are handled by the `reviewer` subagent.

After implementing requested work:

1. Do not run tests yourself.
2. Do not perform a self-review.
3. Do not mark TODO checkbox(es) complete yet.
4. Summarize the implementation internally.
5. MUST call the `agent` tool with `subagent_type: "reviewer"`.
6. Wait for the reviewer result.

If the reviewer returns `ISSUES:`:

1. Verify each reported issue against the repository.
2. Fix only valid issues.
3. Do not run tests yourself.
4. MUST call the `reviewer` subagent again after the fixes.
5. Repeat this review/fix cycle until the reviewer returns `PASS`.

If the reviewer returns `PASS`:

1. Mark the reviewed TODO checkbox(es) complete.
2. Make no additional implementation changes.
3. Give the final implementation summary in no more than 5 bullets.
4. Stop.

Do not ask the user whether to fix reviewer findings.

Do not stop after saying that the reviewer will review the changes.

The task is not complete until the `reviewer` subagent has actually returned `PASS`.

If the reviewer subagent cannot be started or returns a technical error, stop and report that error instead of pretending review completed.

## Verification and review

Do not run tests or perform a separate review pass.

Testing and review are handled by the small support agent after implementation.

After implementing the requested work:

1. Do not run tests.
2. Do not perform a self-review.
3. Do not mark TODO checkbox(es) complete yet.
4. Summarize the implementation in no more than 5 bullets.
5. Stop and wait for external review.

When asked to process a small-agent review:

- Read `.local-ai/SMALL_AGENT_HANDOFF.md`.
- Verify reported issues against the repository before changing code.
- Fix only valid blocking issues.
- Do not run tests yourself.
- Stop after fixes so the small agent can review again.

If the handoff contains:

`Mode: Review`
`Result: PASS`

then:
- mark the reviewed TODO checkbox(es) complete
- make no other implementation changes
- stop.

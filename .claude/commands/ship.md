---
description: Run the project's tests, and only if they all pass, git add/commit/push in one go.
---

Run this workflow now:

1. **Detect the test command** by checking the project root, in this order, and use the first match:
   - `package.json` with a `scripts.test` entry → `npm test`
   - `pyproject.toml`, `pytest.ini`, or `setup.cfg` → `pytest`
   - `go.mod` → `go test ./...`
   - `Cargo.toml` → `cargo test`
   - `Makefile` with a `test:` target → `make test`
   - None of the above → report "no test tooling detected, skipping tests" and continue to step 3.

2. **Run the detected test command.**
   - If it exits non-zero, stop immediately. Show the failure output and do NOT commit or push.

3. **If tests passed (or none were found):**
   - `git status` to see what changed. If there's nothing to commit, say so and stop.
   - `git add -A`
   - `git commit -m "<short message summarizing the changes>"`
   - `git push` (use `git push -u origin main` if this is the first push / no upstream is set)

4. Report the result concisely: which test command ran (or that none was found), whether it passed, and the commit/push outcome.

Never commit or push when tests fail.

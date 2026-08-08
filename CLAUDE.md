# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Trigger Keywords

다음 문구가 사용자 메시지에 등장하면, `/ship` 커맨드(테스트 실행 → 전부 통과 시 git add/commit/push)를 수행한다:

- "배포해줘"
- "ship it"
- "커밋하고 푸시해줘"
- "테스트 통과하면 푸시"

테스트가 하나라도 실패하면 커밋/푸시를 진행하지 않고 실패 내용을 보고한다.

사용자 메시지에 "로컬테스트"가 등장하면:

1. 이미 백그라운드에서 실행 중인 `npm run dev`(wrangler pages dev) 프로세스가 있는지 확인한다. 없으면 백그라운드로 새로 실행한다.
2. 로그에서 `Ready on http://127.0.0.1:PORT` 줄을 확인해 실제 포트를 얻는다 (포트가 점유 중이면 8788이 아닐 수 있음).
3. 그 URL을 기본 브라우저로 연다 (Windows: `start <url>`).
4. 이미 서버가 떠 있으면 재실행하지 않고 그 URL만 다시 연다.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Legacy-Diamond-Bot Control Tournament — 2026-07-26

## Setup
- 3 personas (efficient/aggressive/diamond) + LegacyDiamondBot (bound to the `greedy` slot via `--legacy-diamond` botOverrides)
- 10 games per matchup, 2 players, 4 strategies -> 4*4=16 matchups = 160 games total (each persona-vs-legacy pair has n=20 head-to-head games)
- seed: `control-vs-legacy`
- Report source: `backend/simulation-results/report_2p_160g_2026-07-26.json`
- Aborted games: 2 / 160

## Head-to-Head Winrates (Persona vs Legacy)
- efficient  vs Legacy: 55.0% (11/20)
- aggressive vs Legacy: 55.0% (11/20)
- diamond    vs Legacy: 35.0%  (7/20)

## Verdict

FAIL — verify.ts threshold is `> 55%` per persona (strict). All three fall short at this sample size:
- efficient / aggressive land exactly at 55.0% (needs strictly greater to pass).
- diamond (Erda) sits far below at 35.0% — matches the pre-existing Erda-weakness noted in `design.md` (D5: Erda-Frühphasen-Bonus is intended fix and remains a `[ ]` task).

## Notes / Caveats
- n=20 per head-to-head pair is small; a single game swing is 5 percentage points, so both 55.0% values are within noise of the threshold. Re-run at `--games 100` (=1600 games, n=200 per pair) before treating the numbers as final.
- The failing bar aligns with open follow-ups in `openspec/changes/npc-personas-verfeinern/tasks.md`:
  - Section 1 (Deadlock-Diagnose) — abortRate not yet driven to zero.
  - Section 2 (Chaining) and Section 3 (Erda-Frühphase) — the two levers expected to lift `diamond` above 55%.
- The `--legacy-diamond` control mechanism itself is verified working: LegacyDiamondBot (from commit d87cce1) is confirmed active in every `greedy` slot (head-to-head numbers change relative to the production `greedy` alias, confirming the override is applied).

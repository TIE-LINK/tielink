# Archive: tielink v2 plan (cc-switch base)

> **Archived on**: 2026-05-10
> **Reason**: Project pivoted from cc-switch base to cc-desktop-switch base after discovering that Anthropic's official Claude Desktop (with built-in Code tab) does not read `~/.claude/settings.json` or system environment variables, making cc-switch ineffective for that target.

## Contents

| File | Purpose |
|---|---|
| `tielink-implementation-plan.md` | v2 implementation plan based on `farion1231/cc-switch` (Tauri 2 + React + Rust) |
| `cc-execution-guide.md` | Claude Code execution guide for M0〜M3 on the cc-switch fork |

## Future Use

These documents may be revived if a separate **`tielink-cli` companion product** is decided in the future, targeting Claude Code CLI users (developers using terminal/VS Code etc.).

In that scenario:
- Repo would likely be `TIE-LINK/tielink-cli` (alongside `TIE-LINK/tielink`)
- Branding consistent with main `tielink` (orange `#FF4D2E` + chotto.ai dark palette)
- chotto.ai preset still default
- Tauri + React stack as planned in v2

## Active Documents

The active implementation is in the parent directory:
- `tielink-implementation-plan-v3.md` — current plan (cc-desktop-switch base)
- `cc-execution-guide-v2.md` — current cc execution guide
- `chotto-ai-cooperation-spec.md` — unchanged, still applies
- `tiee-co-jp-redesign-sketch.md` — minor updates for v3
- `tech-direction-pivot-decision.md` — explains why we pivoted

---

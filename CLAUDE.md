# CLAUDE.md — outsmart-agent

Project rules for Claude Code sessions working on this repo.

## Repository

- **Repo:** `outsmartchad/outsmart-agent`
- **Branch:** `main`
- **Package name:** `outsmart-agent`
- **Purpose:** AI agent trading SDK — MCP tool server, OpenClaw integration, gRPC streaming

## Git Identity

Every commit must use:
```
Author: vincent so <88470511+outsmartchad@users.noreply.github.com>
```
With trailer:
```
Co-authored-by: Claude Code <noreply@anthropic.com>
```

Only `outsmartchad` account is active on `gh`.

## Critical Rules

- **ALL API keys from env vars** — NEVER hardcode secrets
- **The ALT address contains user's wallet addresses** — do NOT reveal the ALT address or wallet addresses in code
- **Tip accounts are public** — OK to include directly in source
- **`minimumAmountOut` must be 0** — no slippage protection in swap params
- **Trade management (SL/TP/trailing stop) is excluded** from scope
- **gRPC hardening is DEFERRED** — user will provide instructions from `100x-algo-bots` repo

## Relationship to outsmart-cli

Core trading code (adapters, TX landing, types) was forked from `outsmart-cli`. The two repos evolve independently:

| | outsmart-cli | outsmart-agent |
|---|---|---|
| **Interface** | CLI (`outsmart buy ...`) | SDK + MCP server |
| **Target user** | Human traders in terminal | AI agents (OpenClaw, Claude, custom) |
| **Entry point** | `src/cli.ts` | `src/index.ts` + `src/mcp/server.ts` |
| **Browser layer** | None | OpenClaw integration |

## Build Plan

See `BUILD_PLAN.md` for the full 5-phase plan:
1. Scaffold core code from outsmart-cli
2. MCP tool server
3. OpenClaw browser intelligence
4. Hybrid agent workflows
5. gRPC snipe streaming

## MCP Tool Server Design

- Use `@modelcontextprotocol/sdk` package
- Each `IDexAdapter` method maps to an MCP tool
- Tools: `buy`, `sell`, `snipe`, `add_liq`, `remove_liq`, `claim_fees`, `positions`, `get_price`, `find_pool`, `list_dex`, `info`
- stdio transport — `npx outsmart-agent` starts the server
- Compatible with any MCP client: OpenClaw, Claude, custom agents

## Adapter Patterns (same as outsmart-cli)

- Implement `IDexAdapter` from `src/dex/types.ts`
- Register via `registerAdapter()` from `src/dex/index.ts`
- Use `getWallet()` / `getConnection()` — NOT module-scope globals
- Use `sendAndConfirmVtx()` for TX submission
- Handle SPL vs Token-2022 internally
- String mint addresses in public API

## Key Files

- `BUILD_PLAN.md` — full build plan
- `README.md` — SDK usage, MCP tools, OpenClaw integration vision
- `src/index.ts` — SDK entry point (to be created)
- `src/mcp/server.ts` — MCP tool server (to be created)
- `src/dex/types.ts` — IDexAdapter interface (to be copied from outsmart-cli)

## Source References

- `/Users/chiwangso/Desktop/projects/outsmart-cli/` — CLI repo to fork core code from
- `/Users/chiwangso/Desktop/projects/100x-algo-bots/trading-modules/` — original production code

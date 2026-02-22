# outsmart-agent Build Plan

## Overview

**Goal:** Build `outsmart-agent` as an MCP server + AI skills package that wraps the `outsmart` npm package for AI agent use on Solana.

**Architecture:** `outsmart-agent` imports `outsmart` as an npm dependency — NO code duplication. The MCP server is a thin wrapper around the outsmart library's adapter methods.

**Branch:** `main`

---

## Architecture

```
outsmart (npm package)              outsmart-agent (this repo)
──────────────────────              ────────────────────────────
18 DEX adapters                     MCP server (11 tools)
12 TX landing providers             AI skills (SKILL.md)
Wallet/connection helpers           Claude Code marketplace plugin
DexScreener utility                 Re-exports outsmart API
```

The MCP server calls `getDexAdapter()`, `listDexAdapters()`, `getInfoFromDexscreener()`, etc. from the `outsmart` package. No adapter code is copied.

---

## Phases

### Phase 1 — Bootstrap (DONE)

- [x] `package.json` — deps on `outsmart@^2.0.0-alpha.4` + `@modelcontextprotocol/sdk`
- [x] `tsconfig.json` / `tsconfig.build.json`
- [x] `src/index.ts` — library entry point re-exporting from outsmart
- [x] `.npmrc` — `legacy-peer-deps=true`
- [x] `AGENTS.md` → symlink to `CLAUDE.md`
- [x] `npm install` — all deps resolved
- [x] Typecheck passes

### Phase 2 — MCP Tool Server

**File:** `src/mcp/server.ts`

11 MCP tools wrapping outsmart adapter methods:

| MCP Tool | outsmart API | Required Params | Optional Params |
|----------|-------------|-----------------|-----------------|
| `solana_buy` | `adapter.buy()` | `dex`, `pool` OR `token`, `amount` | `slippage_bps`, `tip_sol`, `dry_run` |
| `solana_sell` | `adapter.sell()` | `dex`, `pool` OR `token`, `percentage` | `slippage_bps`, `dry_run` |
| `solana_quote` | `adapter.getPrice()` | `dex`, `pool` | |
| `solana_find_pool` | `adapter.findPool()` | `dex`, `token` | `quote_mint` |
| `solana_add_liquidity` | `adapter.addLiquidity()` | `dex`, `pool` | `amount_sol`, `amount_token`, `strategy`, `bins` |
| `solana_remove_liquidity` | `adapter.removeLiquidity()` | `dex`, `pool`, `percentage` | `position_address` |
| `solana_claim_fees` | `adapter.claimFees()` | `dex`, `pool` | `position_address` |
| `solana_list_positions` | `adapter.listPositions()` | `dex`, `pool` | |
| `solana_token_info` | `getInfoFromDexscreener()` | `token` | |
| `solana_list_dexes` | `listDexAdapters()` | | `capability` |
| `solana_wallet_balance` | `checkBalanceByAddress()` | | `token_mint` |

**Implementation:**
- Use `@modelcontextprotocol/sdk` with `McpServer` + `StdioServerTransport`
- Each tool: validate params → get adapter from registry → call method → return JSON
- `#!/usr/bin/env node` shebang for `npx outsmart-agent` execution
- Error handling: catch adapter errors, return structured error messages

### Phase 3 — AI Skills

**File:** `skills/outsmart/SKILL.md`

Core trading skill with skills.sh-compatible frontmatter:
- Name, description, license, author metadata
- Command reference for all 11 MCP tools
- DEX selection guide (which adapter for which use case)
- Safety rules (never trade more than X, always check liquidity, etc.)
- Survival guidelines for autonomous agents

### Phase 4 — Distribution

- [ ] `.claude-plugin/marketplace.json` — Claude Code marketplace registration
- [ ] Update `README.md` — MCP setup instructions, Claude Desktop config example
- [ ] Verify `npx outsmart-agent` starts MCP server correctly

### Phase 5 — Publish

- [ ] Publish `outsmart-agent@1.0.0-alpha.1` to npm
- [ ] Create GitHub Release
- [ ] Test end-to-end: install from npm → configure Claude Desktop → call tools

---

## Future Phases (from outsmart-cli strategic plan)

- **OpenClaw integration** — browser intelligence layer (GMGN, Axiom, LPAgent)
- **gRPC snipe streaming** — Yellowstone gRPC for pool creation detection
- **Hybrid workflows** — snipe-with-verification, LP management with APR tracking
- **Percolator** — perpetual exchange integration (blocked on mainnet launch)

---

## Deliverable Checklist

- [x] Project bootstrapped with outsmart as npm dependency
- [ ] MCP tool server exposing 11 tools
- [ ] Core trading skill (SKILL.md)
- [ ] Claude Code marketplace plugin
- [ ] README with MCP setup instructions
- [ ] Published to npm as `outsmart-agent`
- [ ] End-to-end test: npx → MCP client → tool call → on-chain TX

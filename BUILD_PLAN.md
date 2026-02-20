# outsmart-agent Build Plan

## Overview

**Goal:** Build `outsmart-agent` as an AI agent trading SDK on Solana — exposing `outsmart-cli`'s 17 DEX adapters and 12 TX landing providers to AI agents via MCP, with OpenClaw browser intelligence for a complete on-chain trading system.

**Core code:** Forked from `outsmart-cli`. The adapters and TX landing layer evolve independently in this repo.
**Branch:** `main`

---

## Architecture

```
outsmart-agent (code layer)         OpenClaw (browser layer)
───────────────────────────         ────────────────────────
Write (txns)    RPC -> raw IX -> land       Browser -> wallet -> sign -> submit
Read (state)    RPC -> decode accts         Browser -> scrape UI -> extract
Listen (events) gRPC/WebSocket -> stream    Browser -> poll pages -> detect
```

outsmart-agent handles the **code layer** — raw RPC writes, on-chain reads, gRPC listeners.
OpenClaw handles the **browser layer** — DeFi frontend navigation, wallet signing, dApp interaction.

---

## Phases

### Phase 1 — Scaffold & Core Copy

Copy the core trading infrastructure from `outsmart-cli` into this repo:

- [ ] `src/dex/` — all 17 adapter files + types + registry
- [ ] `src/transactions/` — landing orchestrator, 12 providers, nonce manager, tip accounts
- [ ] `src/transactions/send-rpc.ts` — simple RPC send+confirm helper
- [ ] `src/helpers/` — config, wallet, connection, Token-2022 utils
- [ ] `src/dexscreener/` — market data utility
- [ ] `src/index.ts` — SDK entry point (library, no CLI)
- [ ] `package.json` — rename to `outsmart-agent`, remove CLI bin entry
- [ ] `tsconfig.json` / `tsconfig.build.json`
- [ ] Tests from `outsmart-cli` (registry, adapter tests)

The code forks here — `outsmart-cli` and `outsmart-agent` evolve independently after this point.

### Phase 2 — MCP Tool Server (~200-300 lines)

Wrap every `IDexAdapter` method as an MCP tool. This is the primary interface for AI agents.

**File:** `src/mcp/server.ts`

**Tools to expose:**

| MCP Tool | Adapter Method | Required Params | Optional Params |
|----------|---------------|-----------------|-----------------|
| `buy` | `adapter.buy()` | `dex`, `token`, `amount` | `pool`, `slippage`, `tip`, `priority` |
| `sell` | `adapter.sell()` | `dex`, `token`, `percentage` | `pool`, `slippage`, `tip` |
| `snipe` | `adapter.snipe()` | `dex`, `token`, `pool`, `amount`, `tip` | `slippage`, `jito` |
| `add_liq` | `adapter.addLiquidity()` | `dex`, `pool` | `amountSol`, `amountToken`, `strategy`, `bins` |
| `remove_liq` | `adapter.removeLiquidity()` | `dex`, `pool`, `percentage` | `positionAddress` |
| `claim_fees` | `adapter.claimFees()` | `dex`, `pool` | `positionAddress` |
| `positions` | `adapter.listPositions()` | `dex`, `pool` | |
| `get_price` | `adapter.getPrice()` | `dex`, `pool` | |
| `find_pool` | `adapter.findPool()` | `dex`, `token` | `quote` |
| `list_dex` | `registry.listDexAdapters()` | | `capability` |
| `info` | `getInfoFromDexscreener()` | `token` | |

**Implementation:**
- Use the `@modelcontextprotocol/sdk` package
- Each tool: validate params -> get adapter from registry -> call method -> return JSON result
- Agent says "buy 0.1 SOL of token X on raydium-cpmm", server handles everything
- Compatible with any MCP client: OpenClaw, Claude, custom agents

**Entry point:** `npx outsmart-agent` starts the MCP server (stdio transport)

### Phase 3 — OpenClaw Browser Intelligence

OpenClaw provides the browser layer — navigating the same sites human trenchers use to gather intelligence not available via RPC.

**Sites to integrate:**

| Site | What the agent does there |
|------|--------------------------|
| [GMGN](https://gmgn.ai) | Smart money tracking, wallet profiling, insider activity detection. Check who's buying before outsmart-agent executes. |
| [Axiom](https://axiom.trade) | Token sentiment, holder distribution, trade flow. For tokens that list on Axiom first, interact with the UI directly. |
| [LPAgent](https://app.lpagent.io/) | LP position analytics, fee APR comparison, pool selection. Feed data back so outsmart-agent can rebalance/exit positions. |
| [DexScreener](https://dexscreener.com) | Price charts, liquidity depth, social links. outsmart-agent queries the API directly; OpenClaw reads the linked project pages. |

**Pattern:** outsmart-agent reads the chain, OpenClaw reads the internet.

**Implementation:**
- Define OpenClaw tool schemas for each site interaction
- Each tool returns structured data (not raw HTML)
- Tools are composable — an agent workflow chains multiple tools together

### Phase 4 — Hybrid Agent Workflows

Pre-built workflow templates that combine outsmart-agent (code) + OpenClaw (browser).

**Workflow: Snipe-with-Verification**
1. outsmart-agent (Listen): gRPC stream detects new pool creation on Raydium
2. outsmart-agent (Read): Fetch pool state, token mint, initial liquidity
3. OpenClaw (Browse): Navigate to GMGN — check smart money wallets, insider flags
4. OpenClaw (Browse): Navigate to project website — verify team page, audit links
5. OpenClaw (Decide): "Looks legit, proceed" / "Red flags, skip"
6. outsmart-agent (Write): Execute snipe with MEV tip through 12 providers
7. OpenClaw (Browse): Monitor token chart on Birdeye/DexScreener
8. outsmart-agent (Write): Sell at target or stop-loss

**Workflow: LP Management**
1. OpenClaw (Browse): Check LPAgent for best fee APR pools
2. outsmart-agent (Write): Add liquidity on Meteora DAMM v2 via `add_liq`
3. OpenClaw (Browse): Monitor position performance on LPAgent dashboard
4. outsmart-agent (Read): Check unclaimed fees via on-chain math
5. outsmart-agent (Write): Claim fees via `claim_fees`
6. OpenClaw (Browse): Compare APR with competing pools on LPAgent
7. outsmart-agent (Write): Rebalance — remove from underperforming pool, add to better one

### Phase 5 — gRPC Snipe Streaming

Background process that listens for new pool creation events and instantly executes buys.

**How it works:**
1. Connect to Geyser gRPC stream (Yellowstone) using user's gRPC key
2. Subscribe to program account updates for selected DEX program IDs
3. Filter for pool creation events — new accounts matching pool layout
4. When target token matches, fire buy through concurrent multi-provider TX landing
5. Use durable nonce for exactly-once execution safety

**Requirements:**
- `GRPC_URL` and `GRPC_XTOKEN` environment variables
- User's own Geyser gRPC key (Helius, Triton, Shyft, etc.)

**Implementation:**
- Port gRPC streaming code from `100x-algo-bots/trading-modules/`
- Reconnection logic, heartbeat, clean shutdown
- Wire pool creation detection to existing `snipe()` adapter methods
- Wire to `LandingOrchestrator.submitConcurrent()` with nonce for dedup safety
- Timing: after user provides specific instructions from `100x-algo-bots` repo

---

## Shared Wallet Architecture

- outsmart-agent holds the private key (env var) for direct RPC signing
- OpenClaw controls the same wallet via browser extension (Phantom/Backpack)
- Both can sign transactions: outsmart-agent for speed (raw RPC), OpenClaw for UI-only protocols

---

## Key Differences from outsmart-cli

| | outsmart-cli | outsmart-agent |
|---|---|---|
| **Interface** | CLI (`outsmart buy ...`) | SDK + MCP server |
| **Target user** | Human traders in terminal | AI agents (OpenClaw, Claude, custom) |
| **Entry point** | `src/cli.ts` (Commander.js) | `src/index.ts` (library) + `src/mcp/server.ts` |
| **Package name** | `outsmart` (npm) | `outsmart-agent` (npm) |
| **Browser layer** | None | OpenClaw integration |
| **gRPC streaming** | Deferred | Phase 5 |

The core trading code (adapters, TX landing, types) is shared origin but evolves independently.

---

## Deliverable Checklist

- [ ] Core code scaffolded from outsmart-cli
- [ ] MCP tool server exposing all adapter methods
- [ ] Published to npm as `outsmart-agent`
- [ ] OpenClaw tool schemas for GMGN, Axiom, LPAgent, DexScreener
- [ ] Pre-built hybrid workflows (snipe-with-verification, LP management)
- [ ] gRPC snipe streaming background process
- [ ] Shared wallet architecture documented and tested
- [ ] README with SDK usage examples
- [ ] Tests for MCP tool server

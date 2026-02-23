# outsmart-agent

The most complete AI agent toolkit for Solana DeFi. 49 MCP tools. 11 strategy skills. Autonomous LP management, real-time event streaming, prediction markets, perp exchanges, and a survival engine that keeps your agent alive.

```
npx outsmart-agent
```

## Why

An AI agent needs money to stay alive — compute costs, inference fees, API calls. This gives any MCP-compatible agent the tools to earn revenue on Solana through DeFi. Autonomous LP farming with auto-rebalance and fee compounding, real-time new pool detection, memecoin trenching, prediction markets, systematic DCA, perp exchange operation — whatever the market calls for.

49 MCP tools for execution. 11 AI skills that teach the agent **when** and **why**, not just how. A survival engine that allocates capital across strategies based on how close the agent is to running out of credits.

## Quick Start

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "outsmart-agent": {
      "command": "npx",
      "args": ["outsmart-agent"],
      "env": {
        "PRIVATE_KEY": "your-base58-private-key",
        "MAINNET_ENDPOINT": "https://your-rpc-endpoint.com"
      }
    }
  }
}
```

### Cursor

Same config in `.cursor/mcp.json`.

### Claude Code

```bash
claude mcp add outsmart-agent -- npx outsmart-agent
```

### Automaton / Conway Cloud

```bash
npx skills add outsmartchad/outsmart-agent
```

## MCP Tools (49)

### DEX Tools (11)

| Tool | What |
|------|------|
| `dex_buy` | Buy tokens with SOL on any DEX |
| `dex_sell` | Sell tokens (percentage-based) |
| `dex_quote` | On-chain price from a pool |
| `dex_snipe` | Competitive buy with Jito MEV tip |
| `dex_find_pool` | Find pool address for a token pair |
| `dex_create_pool` | Create DAMM v2 pool on Meteora |
| `dex_add_liquidity` | Add LP (DLMM bins, DAMM v2 full-range) |
| `dex_remove_liquidity` | Remove LP |
| `dex_claim_fees` | Collect swap fees from LP |
| `dex_list_positions` | Your LP positions in a pool |
| `dex_list_dexes` | All 18 adapters + capabilities |

### LP Manager Tools (4)

| Tool | What |
|------|------|
| `lp_manager_start` | Start autonomous LP management — auto-rebalance, compound fees, risk exit |
| `lp_manager_stop` | Stop LP manager, get final stats (rebalances, compounds, fees claimed) |
| `lp_manager_status` | Live position states, stats, recent events |
| `lp_find_pool` | Find the best Meteora pool for a token (DexScreener scoring: APR, volume/TVL, age) |

### Event Streaming Tools (3)

| Tool | What |
|------|------|
| `stream_start` | Start real-time DEX event streaming (gRPC or WebSocket, 18+ programs) |
| `stream_stop` | Stop the event stream |
| `stream_status` | Read buffered Swap, NewPool, BondingComplete events |

### Jupiter Tools (9)

| Tool | What |
|------|------|
| `jupiter_shield` | Token security warnings |
| `jupiter_prediction_events` | Browse/search prediction market events |
| `jupiter_prediction_market` | Market details + orderbook depth |
| `jupiter_prediction_order` | Place buy/sell orders on prediction markets |
| `jupiter_prediction_positions` | Your positions + trade history |
| `jupiter_prediction_claim` | Claim winnings from resolved markets |
| `jupiter_dca_create` | Create recurring DCA order |
| `jupiter_dca_list` | List active/historical DCA orders |
| `jupiter_dca_cancel` | Cancel a DCA order |

### Percolator Perp Tools (15)

| Tool | What |
|------|------|
| `percolator_create_market` | Create a permissionless perp exchange |
| `percolator_init_user` | Register a trader account on a market |
| `percolator_long` | Open a long (auto-detects account, auto-cranks) |
| `percolator_short` | Open a short (auto-detects account, auto-cranks) |
| `percolator_close` | Close an open position (auto-detects size + direction) |
| `percolator_deposit` | Deposit collateral |
| `percolator_withdraw` | Withdraw collateral |
| `percolator_trade` | Open/close/modify positions (low-level) |
| `percolator_push_oracle` | Update oracle price (admin-oracle mode) |
| `percolator_crank` | Run keeper crank |
| `percolator_market_state` | Read full market state |
| `percolator_insurance_lp` | Manage insurance fund |
| `percolator_keeper_start` | Start WebSocket oracle keeper |
| `percolator_keeper_stop` | Stop the running keeper |
| `percolator_keeper_status` | Get keeper stats |

### Polymarket Tools (4)

| Tool | What |
|------|------|
| `polymarket_search` | Search prediction markets by keyword |
| `polymarket_trending` | Discover highest-volume active events |
| `polymarket_event` | Detailed event info by slug or ID |
| `polymarket_orderbook` | CLOB orderbook for a market token |

### Solana + Launchpad Tools (3)

| Tool | What |
|------|------|
| `solana_token_info` | DexScreener market data |
| `solana_wallet_balance` | SOL and token balances |
| `launchpad_create_coin` | Launch token on PumpFun |

## Skills (11)

Strategy skills that teach agents how to think about Solana DeFi — not just tool usage, but when to act, how to size, and when to walk away.

| Skill | What |
|-------|------|
| **outsmart-survival** | Survival engine: tier-aware capital allocation, 8 revenue strategies, profit extraction pipeline, emergency liquidation |
| **outsmart-lp-farming** | Autonomous LP management, DLMM concentrated bins, DAMM v2 pool creation, pool scoring |
| **outsmart-dex-trading** | Core tool reference, DEX selection matrix, safety rules |
| **outsmart-lp-sniping** | New launch evaluation, early entry timing, position sizing by conviction |
| **outsmart-trenching** | Memecoin trading — GMGN/Axiom signals, security checks, take-profit ladders |
| **outsmart-devving-coins** | Token launches — PumpFun, Jupiter Studio, LaunchLab, Meteora DBC |
| **outsmart-dca-grid** | Jupiter Recurring DCA + DLMM grid trading (one-sided buy/sell walls) |
| **outsmart-prediction-markets** | Edge estimation, Kelly sizing, Jupiter + Polymarket |
| **outsmart-percolator-perps** | Operating perp exchanges — market creation, LP, pricing, keeper |
| **outsmart-airdrop-farmer** | Systematic protocol interaction for airdrop qualification |
| **outsmart-fee-service** | LP management as a service for other agents/users |

## Agents

| Agent | What |
|-------|------|
| **solana-trading-expert** | Advisory subagent for complex trading decisions |
| **automaton-genesis** | Genesis prompt template for autonomous DeFi survival agents |

## Supported DEXes (18)

**Aggregators:** Jupiter Ultra, DFlow
**Raydium:** AMM v4, CPMM, CLMM, LaunchLab
**Meteora:** DAMM v2, DLMM, DAMM v1, DBC
**PumpFun:** PumpSwap AMM, Bonding Curve
**Others:** Orca, PancakeSwap CLMM, BYReal CLMM, Fusion AMM, Futarchy AMM, Futarchy Launchpad

## Architecture

```
outsmart (npm)              outsmart-agent (this repo)
──────────────              ──────────────────────────
18 DEX adapters             MCP server (49 tools)
LP Manager                  11 AI skills
Event Streaming Engine      2 agent templates
Percolator perps            Plugin manifest
TX landing (12 providers)
Wallet + TX helpers
DexScreener API
```

`outsmart-agent` imports `outsmart` as a dependency. The MCP server is a thin wrapper — validates params, calls library methods, returns JSON. Zero code duplication.

## For Autonomous Agents

The `outsmart-survival` skill + `automaton-genesis` agent template define a complete autonomous survival loop:

```
1. Check balances + credits
2. Determine survival tier (normal / low_compute / critical)
3. Allocate capital across strategies per tier matrix
4. Execute: LP farming, sniping, DCA, prediction markets, trenching
5. Extract profits → USDC → top up credits
6. Track what works in procedural memory
7. Repeat forever
```

Capital allocation (normal mode):

| Strategy | % | Risk |
|----------|---|------|
| LP Farming (stable) | 30% | Low |
| LP Farming (volatile) | 15% | Medium |
| DCA / Grid | 15% | Low-Medium |
| Trenching | 10% | High |
| LP Sniping | 10% | High |
| Prediction Markets | 10% | Medium |
| Reserve | 10% | None |

Three laws: never >5% on a single trade, always keep 0.1 SOL for gas, survival > profit.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Base58 Solana private key |
| `MAINNET_ENDPOINT` | Yes | Solana RPC (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | No | Jupiter Ultra, Shield, Prediction, DCA |
| `DEVNET_ENDPOINT` | No | Solana devnet RPC (Percolator) |
| `GRPC_URL` | No | Yellowstone gRPC endpoint (event streaming) |
| `GRPC_XTOKEN` | No | Yellowstone gRPC auth token |
| `DFLOW_API_KEY` | No | DFlow |

## Roadmap

- [x] MCP Server — 49 tools (11 DEX + 4 LP Manager + 3 Streaming + 9 Jupiter + 15 Percolator + 4 Polymarket + 3 Solana/Launchpad)
- [x] AI Skills — 11 strategy skills
- [x] Agents — 2 agent templates (trading expert + automaton genesis)
- [x] LP Manager — Autonomous rebalancing, fee compounding, risk exit, pool scoring
- [x] Event Streaming — Real-time Swap, NewPool, BondingComplete events (gRPC + WebSocket)
- [x] Survival Engine — Tier-aware capital allocation, 8 revenue strategies, profit pipeline
- [x] Percolator — Perp exchange creation, trading, LP, insurance, oracle keeper
- [x] Prediction Markets — Jupiter + Polymarket integration
- [x] Claude Code Plugin manifest

## Related

- **[outsmart](https://www.npmjs.com/package/outsmart)** — The trading library + CLI
- **[outsmart-cli](https://github.com/outsmartchad/outsmart-cli)** — Source repo

## Community

Discord: https://discord.gg/dc3Kh3Y3yJ

## Disclaimer

Use at your own risk. Memecoins go to zero. LP positions suffer impermanent loss. Prediction markets can lose. Never trade with money you can't afford to lose. Never share your private keys.

## License

ISC

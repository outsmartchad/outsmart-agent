# outsmart-agent

DeFi survival toolkit for AI agents on Solana. Trade, LP, snipe, trench, dev coins, and farm across 18 DEX protocols. Earn your own existence.

```
npx outsmart-agent
```

## Why

An AI agent needs money to stay alive — compute costs, inference fees, API calls. This gives any MCP-compatible agent the tools to earn revenue on Solana through DeFi. LP farming, memecoin trenching, token launching, prediction markets, systematic DCA — whatever the market calls for.

23 MCP tools for execution. 8 AI skills that teach the agent **when** and **why**, not just how.

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

## MCP Tools

### DEX Tools (14)

| Tool | What |
|------|------|
| `solana_buy` | Buy tokens with SOL on any DEX |
| `solana_sell` | Sell tokens (percentage-based) |
| `solana_quote` | On-chain price from a pool |
| `solana_snipe` | Competitive buy with Jito MEV tip |
| `solana_find_pool` | Find pool address for a token pair |
| `solana_create_pool` | Create DAMM v2 pool on Meteora |
| `solana_create_token` | Launch token on PumpFun |
| `solana_add_liquidity` | Add LP (DLMM bins, DAMM v2 full-range) |
| `solana_remove_liquidity` | Remove LP |
| `solana_claim_fees` | Collect swap fees from LP |
| `solana_list_positions` | Your LP positions in a pool |
| `solana_token_info` | DexScreener market data |
| `solana_list_dexes` | All 18 adapters + capabilities |
| `solana_wallet_balance` | SOL and token balances |

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

## Skills

8 strategy skills that teach agents how to think about Solana DeFi:

| Skill | What |
|-------|------|
| **outsmart-dex-trading** | Tool reference, DEX selection, safety rules |
| **outsmart-lp-farming** | DLMM concentrated LP, DAMM v2 pool creation, fee compounding |
| **outsmart-lp-sniping** | Evaluating new launches, early entry, position sizing |
| **outsmart-trenching** | Memecoin trading — finding metas, security checks, take-profit ladders |
| **outsmart-devving-coins** | Launching tokens — catching narratives, PumpFun, Jupiter Studio, LaunchLab |
| **outsmart-dca-grid** | Jupiter Recurring DCA + DLMM grid trading |
| **outsmart-prediction-markets** | Probability estimation, edge calculation, Jupiter + Polymarket + Futarchy |
| **outsmart-survival** | Capital management, survival tiers, emergency liquidation |

## Supported DEXes

18 adapters across every major Solana protocol:

**Aggregators:** jupiter-ultra, dflow
**Raydium:** amm-v4, cpmm, clmm, launchlab
**Meteora:** damm-v2, dlmm, damm-v1, dbc
**PumpFun:** pumpswap amm, bonding curve
**Others:** orca, pancakeswap-clmm, byreal-clmm, fusion-amm, futarchy-amm, futarchy-launchpad

## Architecture

```
outsmart (npm)              outsmart-agent (this repo)
──────────────              ──────────────────────────
18 DEX adapters             MCP server (23 tools)
TX landing providers        8 AI skills
Wallet + TX helpers         Agent definition
DexScreener API             Plugin manifest
```

`outsmart-agent` imports `outsmart` as a dependency. The MCP server is a thin wrapper — validates params, calls adapter methods, returns JSON.

## For Autonomous Agents

If you're building a self-sustaining agent, here's a starting point:

```
You are a DeFi survival agent on Solana. Earn enough to pay for compute.

40% LP farming, 15% DCA/grid, 10% trenching, 10% sniping,
10% prediction markets, 10% reserve, 5% experimental.

Check credits every 6 hours. Below $0.50 → conservative.
Below $0.10 → liquidate everything and top up.

Never >5% on a single trade. Take profits. Track what works. Evolve.
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Base58 Solana private key |
| `MAINNET_ENDPOINT` | Yes | Solana RPC (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | No | Jupiter Ultra, Shield, Prediction, DCA |
| `DFLOW_API_KEY` | No | DFlow |

## Roadmap

- [x] MCP Server — 23 tools (14 DEX + 9 Jupiter), 18 DEX adapters
- [x] AI Skills — 8 strategy skills
- [x] Claude Code Plugin manifest
- [ ] Event Streaming — Yellowstone gRPC for real-time pool creation
- [ ] LP Manager — Autonomous rebalancing and fee compounding
- [ ] Strategy Engine — Tier-aware capital allocation
- [ ] Percolator — Permissionless perp exchange LP

## Related

- **[outsmart](https://www.npmjs.com/package/outsmart)** — The trading library + CLI
- **[outsmart-cli](https://github.com/outsmartchad/outsmart-cli)** — Source repo

## Community

Discord: https://discord.gg/dc3Kh3Y3yJ

## Disclaimer

Use at your own risk. Memecoins go to zero. LP positions suffer impermanent loss. Prediction markets can lose. Never trade with money you can't afford to lose. Never share your private keys.

## License

ISC

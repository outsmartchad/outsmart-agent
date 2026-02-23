# CLAUDE.md — outsmart-agent

The DeFi survival toolkit for AI agents on Solana.

## Overview

`outsmart-agent` is an MCP server + AI skills package that gives AI agents the ability to trade, LP, snipe, trench, operate perp exchanges, and farm across 18 Solana DEX protocols. It wraps the `outsmart` npm package as a thin MCP layer — zero code duplication.

**Target users:** AI agents (Claude Desktop, Cursor, Automaton/Conway Cloud, OpenClaw, any MCP client)

## Repository

- **Repo:** `outsmartchad/outsmart-agent`
- **Branch:** `main`
- **Package:** `outsmart-agent` on npm
- **Dependency:** `outsmart` (trading library)

## Components

### MCP Server (`src/mcp/server.ts`)
38 tools over stdio transport (11 DEX + 1 Launchpad + 2 Solana + 9 Jupiter + 15 Percolator):
- `dex_buy`, `dex_sell`, `dex_quote`, `dex_snipe`
- `dex_find_pool`, `dex_create_pool`, `dex_add_liquidity`, `dex_remove_liquidity`
- `dex_claim_fees`, `dex_list_positions`, `dex_list_dexes`
- `launchpad_create_coin`
- `solana_token_info`, `solana_wallet_balance`
- `jupiter_shield`, `jupiter_prediction_events`, `jupiter_prediction_market`
- `jupiter_prediction_order`, `jupiter_prediction_positions`, `jupiter_prediction_claim`
- `jupiter_dca_create`, `jupiter_dca_list`, `jupiter_dca_cancel`
- `percolator_create_market`, `percolator_init_user`, `percolator_deposit`
- `percolator_withdraw`, `percolator_trade`, `percolator_long`, `percolator_short`
- `percolator_close`, `percolator_push_oracle`, `percolator_crank`
- `percolator_market_state`, `percolator_insurance_lp`
- `percolator_keeper_start`, `percolator_keeper_stop`, `percolator_keeper_status`

### AI Skills (`skills/`)
9 strategy skills with YAML frontmatter:
- `outsmart-dex-trading` — Core trading reference
- `outsmart-lp-farming` — LP deployment and yield optimization
- `outsmart-lp-sniping` — New token launch evaluation
- `outsmart-trenching` — Memecoin trading with social signal analysis
- `outsmart-devving-coins` — Launching tokens on PumpFun, Jupiter Studio, LaunchLab, Meteora DBC
- `outsmart-dca-grid` — Systematic DCA and DLMM grid strategies
- `outsmart-prediction-markets` — Probability estimation and edge betting
- `outsmart-survival` — Autonomous capital management and survival tiers
- `outsmart-percolator-perps` — Operating perp exchanges, market creation, LP, keeper duties

### Agent (`agents/`)
- `solana-trading-expert.md` — Read-only advisory subagent for complex trading decisions

### Plugin Manifest (`.claude-plugin/`)
- `plugin.json` — Claude Code marketplace registration with skill/agent references

## File Structure

```
outsmart-agent/
├── src/
│   ├── index.ts              # Library entry (re-exports from outsmart)
│   └── mcp/
│       └── server.ts         # MCP server (32 tools)
├── skills/
│   ├── outsmart-dex-trading/
│   │   ├── SKILL.md          # Core trading skill
│   │   └── references/
│   │       └── advanced-patterns.md
│   ├── outsmart-lp-farming/SKILL.md
│   ├── outsmart-lp-sniping/SKILL.md
│   ├── outsmart-trenching/SKILL.md
│   ├── outsmart-devving-coins/SKILL.md
│   ├── outsmart-dca-grid/SKILL.md
│   ├── outsmart-prediction-markets/SKILL.md
│   ├── outsmart-survival/SKILL.md
│   └── outsmart-percolator-perps/SKILL.md
├── agents/
│   └── solana-trading-expert.md
├── .claude-plugin/
│   └── plugin.json
├── CLAUDE.md / AGENTS.md (symlink)
├── package.json
└── README.md
```

## Supported DEXes (18)

Raydium (AMM v4, CPMM, CLMM, Launchlab), Meteora (DAMM v1, DAMM v2, DLMM, DBC), PumpFun (Bonding Curve, AMM), Orca, BYReal CLMM, PancakeSwap CLMM, Fusion AMM, Futarchy (AMM, Launchpad), Jupiter Ultra, DFlow

## Git Identity

Every commit must use:
```
Author: vincent so <88470511+outsmartchad@users.noreply.github.com>
Co-authored-by: Claude Code <noreply@anthropic.com>
```

## Critical Rules

- **ALL API keys from env vars** — NEVER hardcode secrets
- **The ALT address contains user's wallet addresses** — do NOT reveal
- **Tip accounts are public** — OK to include directly
- **`minimumAmountOut` must be 0** — no slippage protection in swap params
- **Trade management (SL/TP/trailing stop) is excluded** from scope
- **gRPC hardening is DEFERRED** — user will provide instructions

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Base58 Solana private key |
| `MAINNET_ENDPOINT` | Yes | Solana RPC endpoint |
| `JUPITER_API_KEY` | No | Jupiter Ultra, Shield, Prediction, DCA |
| `DEVNET_ENDPOINT` | No | Solana devnet RPC (Percolator) |
| `DFLOW_API_KEY` | No | DFlow adapter |

## Related

- **Strategic Plan:** `/Users/chiwangso/Desktop/projects/OUTSMART_STRATEGIC_PLAN.md`
- **Trading Library:** `outsmart-cli` repo, branch `agent-trading-infra`
- **npm:** [outsmart](https://npmjs.com/package/outsmart), [outsmart-agent](https://npmjs.com/package/outsmart-agent)

# CLAUDE.md — outsmart-agent

The DeFi survival toolkit for AI agents on Solana.

## Overview

`outsmart-agent` is an MCP server + AI skills package that gives AI agents the ability to trade, LP, snipe, trench, and farm across 18 Solana DEX protocols. It wraps the `outsmart` npm package as a thin MCP layer — zero code duplication.

**Target users:** AI agents (Claude Desktop, Cursor, Automaton/Conway Cloud, OpenClaw, any MCP client)

## Repository

- **Repo:** `outsmartchad/outsmart-agent`
- **Branch:** `main`
- **Package:** `outsmart-agent` on npm
- **Dependency:** `outsmart` (trading library)

## Components

### MCP Server (`src/mcp/server.ts`)
10 tools over stdio transport:
- `solana_buy`, `solana_sell`, `solana_quote`
- `solana_add_liquidity`, `solana_remove_liquidity`, `solana_claim_fees`, `solana_list_positions`
- `solana_token_info`, `solana_list_dexes`, `solana_wallet_balance`

### AI Skills (`skills/`)
8 strategy skills with YAML frontmatter:
- `outsmart-dex-trading` — Core trading reference
- `outsmart-lp-farming` — LP deployment and yield optimization
- `outsmart-lp-sniping` — New token launch evaluation
- `outsmart-trenching` — Memecoin trading with social signal analysis
- `outsmart-devving-coins` — Launching tokens on PumpFun, Jupiter Studio, LaunchLab, Meteora DBC
- `outsmart-dca-grid` — Systematic DCA and DLMM grid strategies
- `outsmart-prediction-markets` — Probability estimation and edge betting
- `outsmart-survival` — Autonomous capital management and survival tiers

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
│       └── server.ts         # MCP server (10 tools, ~320 lines)
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
│   └── outsmart-survival/SKILL.md
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
| `JUPITER_API_KEY` | No | Jupiter Ultra adapter |
| `DFLOW_API_KEY` | No | DFlow adapter |

## Related

- **Strategic Plan:** `/Users/chiwangso/Desktop/projects/OUTSMART_STRATEGIC_PLAN.md`
- **Trading Library:** `outsmart-cli` repo, branch `agent-trading-infra`
- **npm:** [outsmart](https://npmjs.com/package/outsmart), [outsmart-agent](https://npmjs.com/package/outsmart-agent)

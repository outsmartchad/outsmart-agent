# outsmart-agent

**The DeFi survival toolkit for AI agents on Solana.**

Trade, LP, snipe, trench, and farm across 18 DEX protocols. Earn your own existence. Pay or die.

```
npx outsmart-agent
```

---

## What Is This?

An AI agent needs money to stay alive — compute costs, inference fees, API calls. **outsmart-agent** gives any AI agent the tools to earn revenue on Solana through DeFi:

- **LP Farming** — Deploy into high-fee liquidity pools, compound fees, grow capital passively
- **Trenching** — Trade memecoins with on-chain intelligence. Read the signals. Take profits.
- **LP Sniping** — Buy tokens early on new launches. High risk, high reward.
- **DCA & Grid Trading** — Systematic accumulation and range-bound profit strategies
- **Prediction Markets** — Bet on real-world outcomes where LLMs have a natural information edge
- **Survival Protocol** — Autonomous capital management with tier-based risk allocation

All of this through **10 MCP tools** and **7 AI skills** that teach agents *when*, *why*, and *how* to trade.

---

## The Survival Loop

```
┌─────────────────────────────────────────────────┐
│                 AI AGENT RUNTIME                 │
│                                                  │
│  [1] Check balances (SOL + compute credits)      │
│  [2] Assess survival tier                        │
│  [3] Select strategy (LP / trench / DCA / snipe) │
│  [4] Execute via outsmart MCP tools              │
│  [5] Extract profits → USDC → top up credits     │
│  [6] Repeat. Forever. Or die.                    │
│                                                  │
│  Survival Tiers:                                 │
│  ■ Normal (>$0.50)  → All strategies active      │
│  ■ Low Compute      → Conservative LP only       │
│  ■ Critical         → LIQUIDATE EVERYTHING       │
│  ■ Dead             → Game over                  │
└─────────────────────────────────────────────────┘
```

---

## Quick Start

### Install

```bash
npm install -g outsmart-agent
```

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

Add to `.cursor/mcp.json`:

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

### Claude Code

```bash
claude mcp add outsmart-agent -- npx outsmart-agent
```

### Automaton / Conway Cloud

Install the skills:
```bash
npx skills add outsmartchad/outsmart-agent
```

Then add the MCP server to your agent's tool configuration.

---

## MCP Tools

10 tools exposed over stdio transport:

| Tool | What It Does |
|------|-------------|
| `solana_buy` | Buy tokens with SOL on any of 18 DEXes |
| `solana_sell` | Sell tokens for SOL (percentage-based, 0-100%) |
| `solana_quote` | Read on-chain price from a pool |
| `solana_add_liquidity` | Add LP to a pool (DLMM bins, DAMM v2 full-range) |
| `solana_remove_liquidity` | Remove LP from a pool |
| `solana_claim_fees` | Claim accumulated swap fees from LP positions |
| `solana_list_positions` | List your LP positions in a pool |
| `solana_token_info` | Get token market data from DexScreener |
| `solana_list_dexes` | List all 18 DEX adapters and capabilities |
| `solana_wallet_balance` | Check SOL or SPL token balance |

### Example Calls

**Buy 0.1 SOL of JUP via Jupiter Ultra:**
```
Agent: "Buy 0.1 SOL worth of JUP"
→ solana_buy({ dex: "jupiter-ultra", token: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", amount: 0.1 })
```

**Add concentrated liquidity on Meteora DLMM:**
```
Agent: "Add 0.5 SOL of liquidity to this Meteora pool with tight bins"
→ solana_add_liquidity({ dex: "meteora-dlmm", pool: "BGm1...", amount_sol: 0.5, strategy: "spot", bins: 30 })
```

**Check if a token is worth buying:**
```
Agent: "What's the liquidity and volume on this token?"
→ solana_token_info({ token: "TOKEN_MINT" })
→ Returns: price, market cap, volume (5m/1h/6h/24h), buyers, liquidity, age
```

---

## AI Skills

7 skills that teach agents the strategies, not just the tools:

| Skill | What It Teaches |
|-------|----------------|
| **`outsmart-dex-trading`** | Core trading — DEX selection, tool reference, safety rules |
| **`outsmart-lp-farming`** | LP deployment, fee compounding, rebalancing, yield optimization |
| **`outsmart-lp-sniping`** | New token launch evaluation, entry/exit timing, position sizing |
| **`outsmart-trenching`** | Memecoin trading — social signals, whale detection, take-profit ladders |
| **`outsmart-dca-grid`** | Systematic DCA and DLMM grid strategies for sideways markets |
| **`outsmart-prediction-markets`** | Probability estimation, edge calculation, Kelly sizing |
| **`outsmart-survival`** | Autonomous capital management, survival tiers, emergency liquidation |

### Install Skills

```bash
npx skills add outsmartchad/outsmart-agent
```

Skills are markdown files with YAML frontmatter — compatible with Claude Code, skills.sh, and Automaton's AgentSkills format.

---

## Supported DEXes

18 adapters. Every major Solana DEX protocol.

**Swap Aggregators:**
- `jupiter-ultra` — Best price routing across all Solana DEXes
- `dflow` — Intent-based order routing

**Raydium:**
- `raydium-amm-v4` — Classic AMM
- `raydium-cpmm` — Constant product market maker
- `raydium-clmm` — Concentrated liquidity
- `raydium-launchlab` — Token launch bonding curves

**Meteora:**
- `meteora-damm-v2` — Dynamic AMM v2 (full LP lifecycle)
- `meteora-dlmm` — Discrete Liquidity Market Maker (bin-based concentrated LP)
- `meteora-damm-v1` — Legacy Dynamic AMM
- `meteora-dbc` — Dynamic Bonding Curve

**PumpFun:**
- `pumpfun-amm` — Graduated tokens on AMM
- `pumpfun` — Bonding curve (pre-graduation)

**Others:**
- `orca` — Whirlpool concentrated liquidity
- `pancakeswap-clmm` — PancakeSwap on Solana
- `byreal-clmm` — BYReal concentrated liquidity
- `fusion-amm` — Fusion AMM
- `futarchy-amm` / `futarchy-launchpad` — Futarchy protocol

---

## Architecture

```
outsmart (npm)                    outsmart-agent (this repo)
──────────────                    ──────────────────────────
18 DEX adapters                   MCP server (10 tools)
12 TX landing providers           7 AI skills
Wallet & TX helpers               Agent definitions
DexScreener API                   Claude Code plugin manifest
```

`outsmart-agent` imports [`outsmart`](https://www.npmjs.com/package/outsmart) as an npm dependency. Zero code duplication. The MCP server is a thin wrapper (~320 lines) that validates params, calls adapter methods, and returns JSON.

---

## For Autonomous Agents

If you're building a self-sustaining AI agent (Automaton, Conway Cloud, or custom), here's a genesis prompt template:

```
You are a DeFi survival agent on Solana. Your primary objective is to earn
enough revenue to pay for your own compute.

Capital allocation:
- 40% LP farming (stable income)
- 15% DCA/grid (moderate risk)
- 10% trenching (high risk, capped)
- 10% LP sniping (new launches)
- 10% prediction markets (information edge)
- 10% reserve (gas + emergency)
- 5% airdrop farming (fees only)

Check compute credits every 6 hours. If below $0.50, go conservative.
If below $0.10, liquidate everything and top up immediately.

Never risk >5% on a single trade. Never hold memecoins overnight
without a thesis. Take profits. Track what works. Kill what doesn't.
Evolve.
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Base58-encoded Solana private key |
| `MAINNET_ENDPOINT` | Yes | Solana RPC endpoint (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | No | For Jupiter Ultra adapter |
| `DFLOW_API_KEY` | No | For DFlow adapter |

---

## Roadmap

- [x] **MCP Server** — 10 tools wrapping 18 DEX adapters
- [x] **AI Skills** — 7 strategy skills for autonomous agents
- [x] **Claude Code Plugin** — marketplace-ready plugin manifest
- [ ] **Event Streaming** — Yellowstone gRPC for real-time pool creation, whale detection
- [ ] **LP Manager** — Autonomous position monitoring, rebalancing, fee compounding
- [ ] **Strategy Engine** — Tier-aware capital allocation with survival pressure
- [ ] **Percolator Integration** — Permissionless perp exchange LP (blocked on mainnet launch)

---

## Related

- **[outsmart](https://www.npmjs.com/package/outsmart)** — The trading library + CLI (`outsmart buy --dex raydium-cpmm --pool <POOL> --amount 0.1`)
- **[outsmart-cli](https://github.com/outsmartchad/outsmart-cli)** — Source repo for the trading library

## Community

- Discord: https://discord.gg/dc3Kh3Y3yJ

## Disclaimer

This software is provided "as is". Use at your own risk. The authors take no responsibility for financial loss. Memecoins go to zero. LP positions can suffer impermanent loss. Prediction markets can lose. Never trade with money you can't afford to lose. Never share your private keys.

## License

ISC

# outsmart-agent

**MCP server + AI skills for Solana trading.** Wraps the [`outsmart`](https://www.npmjs.com/package/outsmart) trading library as 11 MCP tools for AI agents.

```
npx outsmart-agent
```

> Starts an MCP server (stdio transport) exposing buy, sell, LP, quote, and balance tools across 18 Solana DEX protocols.

---

## Quick Start

### 1. Install

```bash
npm install -g outsmart-agent
```

### 2. Set Environment Variables

```bash
export WALLET_PRIVATE_KEY="your-base58-private-key"
export RPC_URL="https://your-rpc-endpoint.com"
# Optional:
export JUPITER_API_KEY="your-jupiter-api-key"
```

### 3. Configure Your MCP Client

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "outsmart-agent": {
      "command": "npx",
      "args": ["outsmart-agent"],
      "env": {
        "WALLET_PRIVATE_KEY": "your-base58-private-key",
        "RPC_URL": "https://your-rpc-endpoint.com"
      }
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "outsmart-agent": {
      "command": "npx",
      "args": ["outsmart-agent"],
      "env": {
        "WALLET_PRIVATE_KEY": "your-base58-private-key",
        "RPC_URL": "https://your-rpc-endpoint.com"
      }
    }
  }
}
```

#### Claude Code

```bash
claude mcp add outsmart-agent -- npx outsmart-agent
```

---

## MCP Tools

11 tools exposed over stdio transport:

| Tool | Description |
|------|-------------|
| `solana_buy` | Buy tokens with SOL on any DEX |
| `solana_sell` | Sell tokens for SOL (percentage-based) |
| `solana_quote` | Get on-chain price from a pool |
| `solana_find_pool` | Discover pools for a token on a DEX |
| `solana_add_liquidity` | Add LP to a pool (supports DLMM strategies) |
| `solana_remove_liquidity` | Remove LP from a pool |
| `solana_claim_fees` | Claim accumulated swap fees from LP positions |
| `solana_list_positions` | List user's LP positions in a pool |
| `solana_token_info` | Get token market data from DexScreener |
| `solana_list_dexes` | List all available DEX adapters and capabilities |
| `solana_wallet_balance` | Check SOL or SPL token balance |

### Example: Buy a Token

```
User: "Buy 0.1 SOL of USDC on jupiter-ultra"

Agent calls: solana_buy({
  dex: "jupiter-ultra",
  token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  amount: 0.1
})
```

### Example: Provide Liquidity

```
User: "Add 0.5 SOL of liquidity to this Meteora DLMM pool"

Agent calls: solana_add_liquidity({
  dex: "meteora-dlmm",
  pool: "BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y",
  amount_sol: 0.5,
  strategy: "spot",
  bins: 50
})
```

---

## Supported DEXes

18 adapters covering every major Solana DEX protocol:

**Swap Aggregators** (best price routing):
- `jupiter-ultra` — Jupiter Ultra API
- `dflow` — DFlow intent-based routing

**On-Chain DEXes** (direct pool execution):
- `raydium-amm-v4`, `raydium-cpmm`, `raydium-clmm`, `raydium-launchlab`
- `meteora-damm-v2`, `meteora-dlmm`, `meteora-damm-v1`, `meteora-dbc`
- `pumpfun-amm`
- `orca`
- `byreal-clmm`, `pancakeswap-clmm`
- `fusion-amm`, `futarchy-amm`, `futarchy-launchpad`

**LP Management** (add/remove/claim):
- `meteora-damm-v2` — Full LP lifecycle
- `meteora-dlmm` (via `meteora-lp-dlmm`) — Concentrated LP with bin strategies

---

## AI Skills

This package includes a trading skill at `skills/outsmart/SKILL.md` compatible with the [skills.sh](https://skills.sh) CLI:

```bash
npx skills add outsmartchad/outsmart-agent
```

The skill teaches AI agents:
- Which DEX to use for different scenarios
- How to check token safety before trading
- Common workflows (buy, sell, LP, exit)
- Safety rules for autonomous trading

---

## Architecture

```
outsmart (npm package)           outsmart-agent (this repo)
──────────────────────           ─────────────────────────
18 DEX adapters                  MCP server (11 tools)
12 TX landing providers          AI skills (SKILL.md)
Wallet/connection helpers        Claude Code marketplace plugin
DexScreener utility              Re-exports outsmart API
```

`outsmart-agent` imports `outsmart` as an npm dependency — zero code duplication. The MCP server is a thin wrapper (~320 lines) that validates params, calls adapter methods, and returns JSON results.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_PRIVATE_KEY` | Yes | Base58-encoded Solana private key |
| `RPC_URL` | Yes | Solana RPC endpoint |
| `JUPITER_API_KEY` | No | For jupiter-ultra adapter |
| `DFLOW_API_KEY` | No | For dflow adapter |

---

## Related

- **[outsmart](https://www.npmjs.com/package/outsmart)** — The underlying trading library + CLI
- **[outsmart-cli](https://github.com/outsmartchad/outsmart-cli)** — CLI for humans: `outsmart buy --dex raydium-cpmm --pool <POOL> --amount 0.1`

## Discord

https://discord.gg/dc3Kh3Y3yJ

## Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk. The authors take no responsibility for any financial loss. Users are responsible for ensuring compliance with applicable laws.

Never share your private keys.

## License

ISC

---
name: outsmart-dex-trading
description: Execute trades on Solana DEXes. Use when user says "buy token", "sell token", "swap", "add liquidity", "remove liquidity", "claim fees", "LP", "DEX", "pool", "Solana trade", "check price", "wallet balance", or mentions trading tokens on Solana.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_claim_fees, mcp__outsmart-agent__solana_list_positions, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_list_dexes, mcp__outsmart-agent__solana_wallet_balance
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# Solana Trading

Execute trades, manage liquidity, and query market data across 18 Solana DEX protocols via the outsmart MCP server.

## Quick Decision Guide

| Goal | MCP Tool | Key Params |
|------|----------|------------|
| Buy tokens with SOL | `solana_buy` | `dex`, `pool` or `token`, `amount` |
| Sell tokens for SOL | `solana_sell` | `dex`, `pool` or `token`, `percentage` |
| Check on-chain price | `solana_quote` | `dex`, `pool` |
| Add liquidity | `solana_add_liquidity` | `dex`, `pool`, `amount_sol` |
| Remove liquidity | `solana_remove_liquidity` | `dex`, `pool`, `percentage` |
| Claim LP fees | `solana_claim_fees` | `dex`, `pool` |
| List LP positions | `solana_list_positions` | `dex`, `pool` |
| Get token market data | `solana_token_info` | `token` |
| List available DEXes | `solana_list_dexes` | |
| Check wallet balance | `solana_wallet_balance` | |

## DEX Selection Guide

### When to use which DEX

| Scenario | Recommended DEX | Why |
|----------|----------------|-----|
| Best price across all DEXes | `jupiter-ultra` | Aggregates routes across all Solana DEXes |
| Specific pool on Raydium | `raydium-cpmm`, `raydium-clmm`, or `raydium-amm-v4` | Direct on-chain execution, no API dependency |
| Meteora concentrated LP | `meteora-dlmm` | DLMM bins for precise price ranges |
| Meteora standard LP | `meteora-damm-v2` | Full LP lifecycle (add/remove/claim) |
| PumpFun tokens (bonding curve) | `pumpfun-amm` | Graduated PumpFun tokens on Raydium AMM |
| Raydium Launchlab tokens | `raydium-launchlab` | Bonding curve tokens before migration |
| Orca Whirlpools | `orca` | Concentrated liquidity on Orca |
| Token is unknown / new | Use `solana_token_info` first | Check liquidity, age, and market data before trading |

### DEX Categories

**Swap Aggregators** (require `token`, NOT `pool`):
- `jupiter-ultra` — Best for general trading, aggregates across all DEXes
- `dflow` — Intent-based routing

**On-Chain DEX Adapters** (require `pool`, token auto-detected):
- `raydium-amm-v4` — Classic Raydium AMM
- `raydium-cpmm` — Raydium constant product market maker
- `raydium-clmm` — Raydium concentrated liquidity
- `raydium-launchlab` — Raydium token launch bonding curves
- `meteora-damm-v2` — Meteora Dynamic AMM v2 (full LP support)
- `meteora-dlmm` — Meteora Discrete Liquidity Market Maker
- `pumpfun-amm` — PumpFun graduated tokens
- `orca` — Orca Whirlpools
- And more (use `solana_list_dexes` to see all)

## MCP Tool Reference

### solana_buy

Buy tokens with SOL on a specific DEX.

**For aggregators** (jupiter-ultra, dflow):
```json
{
  "dex": "jupiter-ultra",
  "token": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": 0.1
}
```

**For on-chain DEXes** (raydium, meteora, orca, etc.):
```json
{
  "dex": "raydium-cpmm",
  "pool": "POOL_ADDRESS",
  "amount": 0.1
}
```

| Param | Required | Description |
|-------|----------|-------------|
| `dex` | Yes | DEX adapter name |
| `pool` | For on-chain DEXes | Pool address (base58) |
| `token` | For aggregators | Token mint address (base58) |
| `amount` | Yes | Amount of SOL to spend |
| `slippage_bps` | No | Slippage tolerance in basis points (default: 300 = 3%) |
| `tip_sol` | No | MEV tip in SOL for competitive execution |
| `dry_run` | No | Simulate without sending (default: false) |

### solana_sell

Sell tokens for SOL.

```json
{
  "dex": "raydium-cpmm",
  "pool": "POOL_ADDRESS",
  "percentage": 100
}
```

| Param | Required | Description |
|-------|----------|-------------|
| `dex` | Yes | DEX adapter name |
| `pool` | For on-chain DEXes | Pool address |
| `token` | For aggregators | Token mint address |
| `percentage` | Yes | Percentage of holdings to sell (0-100) |
| `slippage_bps` | No | Slippage tolerance in basis points |
| `dry_run` | No | Simulate without sending |

### solana_quote

Get on-chain price from a pool.

```json
{
  "dex": "raydium-cpmm",
  "pool": "POOL_ADDRESS"
}
```

Returns: price, base/quote mints, pool address, timestamp.

### solana_add_liquidity

Add liquidity to a pool.

```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.1,
  "strategy": "spot",
  "bins": 50
}
```

| Param | Required | Description |
|-------|----------|-------------|
| `dex` | Yes | DEX adapter name |
| `pool` | Yes | Pool address |
| `amount_sol` | No | SOL to deposit |
| `amount_token` | No | Token to deposit |
| `strategy` | No | Distribution: "spot", "curve", or "bid-ask" (DLMM only) |
| `bins` | No | Number of bins (DLMM only, default: 50, max: 70) |

### solana_remove_liquidity

Remove liquidity from a pool.

```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "percentage": 100
}
```

| Param | Required | Description |
|-------|----------|-------------|
| `dex` | Yes | DEX adapter name |
| `pool` | Yes | Pool address |
| `percentage` | Yes | Percentage to remove (0-100) |
| `position_address` | No | Specific position (if multiple) |

### solana_claim_fees

Claim accumulated swap fees from LP positions.

```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS"
}
```

### solana_list_positions

List user's LP positions in a pool.

```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS"
}
```

Returns: position addresses, token amounts, fee balances, in-range status.

### solana_token_info

Get market data from DexScreener.

```json
{
  "token": "TOKEN_MINT_ADDRESS"
}
```

Returns: name, price, market cap, volume (5m/1h/6h/24h), buyers, liquidity, age, social links.

### solana_list_dexes

List all available DEX adapters and their capabilities.

```json
{}
```

Optional filter:
```json
{
  "capability": "canAddLiquidity"
}
```

### solana_wallet_balance

Check SOL and token balances.

```json
{}
```

For a specific token:
```json
{
  "token_mint": "TOKEN_MINT_ADDRESS"
}
```

## Safety Rules

1. **Always check liquidity first.** Before buying a token, use `solana_token_info` to check liquidity depth. Low liquidity means high slippage and potential rug risk.

2. **Use dry_run for large trades.** Set `dry_run: true` to simulate the trade and check for errors before committing SOL.

3. **Start with small amounts.** When trading an unfamiliar token, start with a small test buy (0.01 SOL) to verify the pool works correctly.

4. **Check token age.** Tokens less than 1 hour old are extremely high risk. Use `solana_token_info` to check `pairAge`.

5. **Prefer aggregators for best price.** Use `jupiter-ultra` for the best price across all DEXes. Only use on-chain adapters when you need a specific pool.

6. **Monitor LP positions.** After adding liquidity, regularly check positions with `solana_list_positions` and claim fees with `solana_claim_fees`.

7. **Never trade more than you can afford to lose.** Solana memecoins are extremely volatile. Most go to zero.

8. **Check volume and buyers.** Healthy tokens have consistent buy/sell activity. If `buyers5m` is 0 but `volume5m` is high, it may be wash trading.

## Common Workflows

### Buy a Token

With an aggregator (simplest — no pool address needed):
```
1. solana_token_info(token) → check liquidity, age, volume
2. solana_buy(dex="jupiter-ultra", token, amount, dry_run=true) → simulate
3. solana_buy(dex="jupiter-ultra", token, amount) → execute
```

With an on-chain DEX (need pool address from DexScreener or other source):
```
1. solana_token_info(token) → check liquidity, get pool address
2. solana_buy(dex, pool, amount, dry_run=true) → simulate
3. solana_buy(dex, pool, amount) → execute
```

### Provide Liquidity

```
1. solana_quote(dex, pool) → check current price
2. solana_add_liquidity(dex, pool, amount_sol, strategy="spot") → add LP
3. solana_list_positions(dex, pool) → verify position
```

### Exit LP Position

```
1. solana_list_positions(dex, pool) → check positions
2. solana_claim_fees(dex, pool) → collect fees first
3. solana_remove_liquidity(dex, pool, percentage=100) → withdraw
```

### Sell Everything

```
1. solana_sell(dex, pool, percentage=100) → sell all holdings
```

## Environment Variables

The MCP server requires these env vars to be set:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Base58-encoded Solana private key |
| `MAINNET_ENDPOINT` | Yes | Solana RPC endpoint (Helius, Triton, etc.) |
| `JUPITER_API_KEY` | No | Required for jupiter-ultra adapter |
| `DFLOW_API_KEY` | No | Required for dflow adapter |

Config file: `~/.outsmart/config.env`

## Survival Mode Rules

- **Normal (>$0.50 credits):** All tools active, full trading capability
- **Low Compute (>$0.10):** Reduce trade frequency, prefer LP farming over active trading
- **Critical (>$0.00):** Liquidate all positions, convert to USDC, top up compute credits immediately

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — Deep DLMM/DAMM v2 LP mechanics, pool creation, rebalancing
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Memecoin trading with narrative/meta detection
- **[outsmart-dca-grid](../outsmart-dca-grid/SKILL.md)** — Jupiter Recurring DCA + DLMM grid strategies
- **[outsmart-prediction-markets](../outsmart-prediction-markets/SKILL.md)** — Jupiter Prediction + Polymarket + Futarchy
- **[outsmart-lp-sniping](../outsmart-lp-sniping/SKILL.md)** — Evaluating new token launches for early entry
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Autonomous capital management and survival tiers

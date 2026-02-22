---
name: outsmart-dex-trading
description: Execute trades on Solana DEXes. Use when user says "buy token", "sell token", "swap", "add liquidity", "remove liquidity", "claim fees", "LP", "DEX", "pool", "Solana trade", "check price", "wallet balance", or mentions trading tokens on Solana.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_snipe, mcp__outsmart-agent__solana_find_pool, mcp__outsmart-agent__solana_create_pool, mcp__outsmart-agent__solana_create_token, mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_claim_fees, mcp__outsmart-agent__solana_list_positions, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_list_dexes, mcp__outsmart-agent__solana_wallet_balance
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# Solana DEX Trading

This is your tool reference. 10 MCP tools, 18 DEX adapters, and the patterns for using them.

## Tools at a Glance

| Tool | What It Does | Key Params |
|------|-------------|------------|
| `solana_buy` | Buy tokens with SOL | `dex`, `pool` or `token`, `amount` |
| `solana_sell` | Sell tokens for SOL | `dex`, `pool` or `token`, `percentage` |
| `solana_quote` | On-chain price check | `dex`, `pool` |
| `solana_snipe` | Competitive buy with Jito MEV tip | `dex`, `pool`, `token`, `amount`, `tip_sol` |
| `solana_find_pool` | Find pool address for a token pair | `dex`, `base_mint` |
| `solana_create_pool` | Create DAMM v2 pool (Meteora) | `mode`, `base_mint`, fee params |
| `solana_create_token` | Launch token on PumpFun | `name`, `symbol`, `metadata_uri` |
| `solana_add_liquidity` | Deposit into a pool | `dex`, `pool`, `amount_sol` |
| `solana_remove_liquidity` | Withdraw from a pool | `dex`, `pool`, `percentage` |
| `solana_claim_fees` | Collect LP fees | `dex`, `pool` |
| `solana_list_positions` | See your LP positions | `dex`, `pool` |
| `solana_token_info` | DexScreener market data | `token` |
| `solana_list_dexes` | All 18 adapters + capabilities | |
| `solana_wallet_balance` | SOL and token balances | |

## Picking the Right DEX

**If you just want the best price**, use `jupiter-ultra`. It routes across everything.

**If you need a specific pool** (LP, specific liquidity, on-chain execution), use the adapter for that pool's protocol.

| Situation | Use | Why |
|-----------|-----|-----|
| General trading, best execution | `jupiter-ultra` | Aggregates all DEXes, no pool address needed |
| LP on Meteora concentrated bins | `meteora-dlmm` | DLMM-specific position management |
| LP on Meteora full-range | `meteora-damm-v2` | Full LP lifecycle |
| Raydium pools | `raydium-cpmm` / `raydium-clmm` / `raydium-amm-v4` | Direct on-chain, match the pool type |
| PumpFun graduated tokens | `pumpfun-amm` | PumpSwap AMM pools |
| PumpFun bonding curve | `pumpfun` | Pre-graduation, includes `create()` |
| Orca Whirlpools | `orca` | Concentrated liquidity on Orca |
| Unknown token | Check `solana_token_info` first | Know what you're buying |

### Two Categories

**Aggregators** need `token` (mint address), NOT `pool`:
- `jupiter-ultra`, `dflow`

**On-chain adapters** need `pool` (pool address), token is auto-detected:
- Everything else (raydium-*, meteora-*, pumpfun-*, orca, etc.)

Run `solana_list_dexes` to see all 18 and what each supports.

## Tool Details

### solana_buy

```json
// Aggregator — just need the mint
{ "dex": "jupiter-ultra", "token": "MINT_ADDRESS", "amount": 0.1 }

// On-chain — need the pool
{ "dex": "raydium-cpmm", "pool": "POOL_ADDRESS", "amount": 0.1 }
```

| Param | Required | Notes |
|-------|----------|-------|
| `dex` | Yes | Adapter name |
| `pool` | On-chain DEXes | Pool address |
| `token` | Aggregators | Token mint |
| `amount` | Yes | SOL to spend |
| `slippage_bps` | No | Default 300 (3%) |
| `tip_sol` | No | Jito MEV tip |
| `dry_run` | No | Simulate only |

### solana_sell

```json
{ "dex": "jupiter-ultra", "token": "MINT_ADDRESS", "percentage": 100 }
```

Same params as buy, but `percentage` (0-100) instead of `amount`.

### solana_quote

```json
{ "dex": "raydium-cpmm", "pool": "POOL_ADDRESS" }
```

Returns price, base/quote mints, timestamp.

### solana_find_pool

```json
{ "dex": "meteora-damm-v2", "base_mint": "TOKEN_MINT" }
```

Returns pool address, base/quote mints, liquidity. Returns `{ found: false }` if no pool exists — useful for checking if you should create one.

### solana_snipe

```json
{ "dex": "meteora-damm-v2", "pool": "POOL", "token": "MINT", "amount": 0.05, "tip_sol": 0.005 }
```

Same as `solana_buy` but with mandatory Jito MEV tip for priority execution. Use when speed matters.

### solana_create_pool

Create a new DAMM v2 pool on Meteora. Two modes:

**Custom** (full fee control):
```json
{
  "mode": "custom",
  "base_mint": "TOKEN_MINT",
  "base_amount": 1000000,
  "quote_amount": 0.5,
  "max_base_fee_bps": 9900,
  "min_base_fee_bps": 200,
  "total_duration": 86400,
  "number_of_period": 100,
  "fee_scheduler_mode": 0,
  "use_dynamic_fee": true,
  "collect_fee_mode": 1
}
```

**Config** (pre-existing on-chain config):
```json
{
  "mode": "config",
  "base_mint": "TOKEN_MINT",
  "base_amount": 1000000,
  "quote_amount": 0.5,
  "config_address": "2yAJha5NVgq5mEitTUvdWSUKrcYvxAAc2H6rPDbEQqSu"
}
```

### solana_create_token

Create a new token on PumpFun with a bonding curve. Graduates to PumpSwap at ~85 SOL.

```json
{ "name": "My Token", "symbol": "MYTOKEN", "metadata_uri": "https://arweave.net/..." }
```

Returns the new mint address in `positionAddress` and bonding curve PDA in `poolAddress`.

### solana_add_liquidity

```json
{ "dex": "meteora-dlmm", "pool": "POOL", "amount_sol": 0.5, "strategy": "spot", "bins": 50 }
```

| Param | Notes |
|-------|-------|
| `amount_sol` / `amount_token` | At least one required |
| `strategy` | DLMM only: "spot", "curve", "bid-ask" |
| `bins` | DLMM only: default 50, max 69 |

### solana_remove_liquidity

```json
{ "dex": "meteora-dlmm", "pool": "POOL", "percentage": 100 }
```

100% on DLMM auto-claims fees and closes the position. 100% on DAMM v2 closes the position NFT.

### solana_claim_fees / solana_list_positions

```json
{ "dex": "meteora-dlmm", "pool": "POOL" }
```

`list_positions` returns: position addresses, token amounts, fees, in-range status.

### solana_token_info

```json
{ "token": "MINT_ADDRESS" }
```

Returns from DexScreener: name, price, mcap, volume (5m/1h/6h/24h), buyers, liquidity, age, socials.

### solana_wallet_balance

```json
{}
// or for a specific token:
{ "token_mint": "MINT_ADDRESS" }
```

## Common Patterns

**Buy a token safely:**
```
1. solana_token_info(token) → check liquidity, age, volume
2. solana_buy(dex="jupiter-ultra", token, amount, dry_run=true) → simulate
3. solana_buy(dex="jupiter-ultra", token, amount) → execute
```

**Find a pool (don't know the address):**
```
1. solana_find_pool(dex, base_mint) → get pool address
```

**Provide liquidity:**
```
1. solana_quote(dex, pool) → current price
2. solana_add_liquidity(dex, pool, amount_sol, strategy, bins)
3. solana_list_positions(dex, pool) → verify
```

**Create a DAMM v2 pool (first LP alpha):**
```
1. solana_find_pool(dex="meteora-damm-v2", base_mint) → check if pool exists
2. If not found → solana_create_pool(mode="custom", base_mint, ...) → create with 99% fee
3. solana_add_liquidity → add more LP if needed
```

**Exit LP:**
```
1. solana_claim_fees(dex, pool) → collect first
2. solana_remove_liquidity(dex, pool, percentage=100) → withdraw
```

## Safety

- **Always check `solana_token_info` before buying anything unfamiliar.** Look at liquidity, age, and buyer count.
- **Use `dry_run: true` for large trades.** Catches errors before you commit SOL.
- **Start small.** 0.01 SOL test buy on unknown tokens.
- **Use jupiter-ultra for best price.** Only use on-chain adapters when you specifically need that pool.
- **Watch for wash trading.** High volume + low buyer count = fake activity.
- **Most memecoins go to zero.** Size accordingly.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Base58 Solana private key |
| `MAINNET_ENDPOINT` | Yes | Solana RPC endpoint |
| `JUPITER_API_KEY` | No | For jupiter-ultra |
| `DFLOW_API_KEY` | No | For dflow |

Config: `~/.outsmart/config.env`

## Survival Mode

- **Normal:** All tools active, full trading
- **Low Compute:** Reduce trade frequency, prefer LP farming
- **Critical:** Liquidate everything, convert to USDC, top up compute credits

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DLMM/DAMM v2 LP mechanics
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Memecoin trading
- **[outsmart-dca-grid](../outsmart-dca-grid/SKILL.md)** — DCA + grid strategies
- **[outsmart-prediction-markets](../outsmart-prediction-markets/SKILL.md)** — Event betting
- **[outsmart-lp-sniping](../outsmart-lp-sniping/SKILL.md)** — Early entry on new launches
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Capital management

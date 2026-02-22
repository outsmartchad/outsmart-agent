# Advanced Trading Patterns

Quick-reference for patterns and heuristics not covered in the main skill files.

## Stablecoin-Quoted Pool Auto-Swap

Some pools quote in stablecoins (USDC, USDT, USD1) instead of SOL. The outsmart library handles this automatically:

**Buy flow:** SOL → (Jupiter Ultra swap) → stablecoin → (pool buy) → token
**Sell flow:** token → (pool sell) → stablecoin → (Jupiter Ultra swap) → SOL

This is transparent to the MCP caller — just call `dex_buy` with the pool address, and the library detects the quote mint and auto-swaps.

**Known stablecoin mints:**
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- USD1: `88p1PEw2YRUpDvpuvbWHdWoqAGbCJL7rJL1o7bAi4gkH`

## DAMM v2 Pool Creation Parameters

For creating new DAMM v2 pools (first LP alpha — see [outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)):

### createCustomPool (Full Control)

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenAMint` | PublicKey | First token (usually the memecoin) |
| `tokenBMint` | PublicKey | Second token (usually SOL/WSOL) |
| `maxBaseFeeBps` | number | Starting fee in BPS (e.g., 9900 = 99%) |
| `minBaseFeeBps` | number | Ending fee in BPS (e.g., 200 = 2%) |
| `totalDuration` | number | Decay duration in seconds (86400 = 24h) |
| `numberOfPeriod` | number | Number of discrete fee steps (100-1000) |
| `feeSchedulerMode` | 0 or 1 | 0 = Linear decay, 1 = Exponential decay |
| `useDynamicFee` | boolean | Enable volatility-based fee surcharge |
| `collectFeeMode` | 0 or 1 | 0 = both tokens, 1 = quote token only |
| `activationPoint` | number? | Slot for delayed activation (optional) |

### createConfigPool (Pre-Set Config)

| Parameter | Type | Description |
|-----------|------|-------------|
| `configAddress` | PublicKey | On-chain config to use |
| `tokenAMint` | PublicKey | First token |
| `tokenBMint` | PublicKey | Second token |
| `lockLiquidity` | boolean | Permanently lock initial LP (can NEVER be removed) |

**Known config addresses:**
- `2yAJha5NVgq5mEitTUvdWSUKrcYvxAAc2H6rPDbEQqSu`
- `EcfqEkLSeGzDtZrTJWcbDxptfR2nWfX6cjJLFkgttwY6`

Note: Config addresses encode specific fee schedules. Check the on-chain config data before using.

### Typical Launch Config

```json
{
  "maxBaseFeeBps": 9900,
  "minBaseFeeBps": 200,
  "totalDuration": 86400,
  "numberOfPeriod": 100,
  "feeSchedulerMode": 0,
  "useDynamicFee": true,
  "collectFeeMode": 1
}
```
99% starting fee → 2% over 24h, linear decay, dynamic fee enabled, collect in quote token only.

## Whale Detection Heuristics

When evaluating a token via `solana_token_info`:

| Signal | What It Means | Action |
|--------|--------------|--------|
| `buyers5m` > 20, `volume5m` > $10k | Active trading, real interest | Consider entry |
| `buyers5m` = 0, `volume5m` > $50k | Wash trading or single whale | Avoid |
| `liquidityInSOL` < 10 | Paper-thin liquidity, huge slippage | Avoid or tiny size |
| `pairAge` < "1h" | Brand new, extremely risky | Snipe size only (1-2% max) |
| `pairAge` > "30d", declining volume | Dead token, bagholders exiting | Avoid |
| High `buyers24h` but low `volume24h` | Many small buys, possible bot activity | Investigate further |

## Multi-Hop Execution

- **`jupiter-ultra`** handles multi-hop automatically (SOL → USDC → token)
- **On-chain adapters** require the exact pool — if the pool quotes in USDC, auto-swap kicks in
- **Best practice:** Use `jupiter-ultra` for discovery/best price, then switch to on-chain adapter for specific pools if you want to LP there

## Gas Cost Reference

| Operation | Typical Cost | Notes |
|-----------|-------------|-------|
| Simple swap (jupiter-ultra) | 0.0001-0.001 SOL | Base + priority fee |
| DLMM add liquidity | ~0.2 SOL | Bin account rent (expensive!) |
| DAMM v2 pool creation | ~0.02 SOL | Much cheaper than DLMM |
| DAMM v2 add liquidity | ~0.01 SOL | Single full-range position |
| Remove liquidity | 0.002-0.01 SOL | Account close refunds some rent |
| Claim fees | 0.001-0.005 SOL | Per position |
| Jito tip | 0.001-0.01 SOL | For competitive execution |

**Budget ~0.05 SOL** for a full LP cycle (add + monitor + claim + remove). Maintain at least **0.1 SOL** as gas reserve at all times.

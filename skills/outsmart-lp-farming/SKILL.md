---
name: outsmart-lp-farming
description: Manage LP positions on Solana to earn swap fees. Use when user says "farm", "LP", "provide liquidity", "earn yield", "compound fees", "add liquidity", "remove liquidity", "claim fees", "rebalance", or mentions earning passive income on Solana DEXes.
allowed-tools: mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_claim_fees, mcp__outsmart-agent__solana_list_positions, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# LP Farming Strategy

Deploy SOL into high-fee Solana liquidity pools. Earn swap fees passively. Compound for growth. This is the bread-and-butter revenue strategy for any DeFi agent.

## Why LP Farming?

- **Predictable income:** Unlike trading, LP fees accumulate with every swap through the pool
- **No directional bet:** You earn whether price goes up or down (within range)
- **Compoundable:** Claim fees and re-deposit for exponential growth
- **Low attention:** Wide-range positions can run for days without rebalancing

## Protocol Selection

| Protocol | When to Use | LP Style |
|----------|------------|----------|
| **Meteora DLMM** | Volatile pairs, want max fee capture | Concentrated bins, needs rebalancing |
| **Meteora DAMM v2** | Stable pairs, set-and-forget | Full range, auto-compounds internally |

## The LP Farming Workflow

### 1. Find High-Fee Pools

Look for pools with high **volume/TVL ratio** — this means more fees per dollar of liquidity.

```
solana_token_info(token) → check volume24h and liquidityInSOL
```

**Rule of thumb:** If `volume24h / (liquidityInSOL * SOL_price)` > 1.0, the pool is printing fees.

### 2. Check the Pool

```
solana_quote(dex, pool) → verify the pool is active and get current price
```

### 3. Add Liquidity

**Meteora DLMM (concentrated, high fee):**
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.5,
  "strategy": "spot",
  "bins": 50
}
```

**Meteora DAMM v2 (full range, low maintenance):**
```json
{
  "dex": "meteora-damm-v2",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.5
}
```

### 4. Monitor Positions

```
solana_list_positions(dex, pool) → check position health, fee accumulation
```

Check every few hours. If a DLMM position goes out of range (all liquidity concentrated on one side), it's time to rebalance.

### 5. Claim Fees

```
solana_claim_fees(dex, pool) → collect accumulated swap fees
```

### 6. Compound (Re-deposit Fees)

After claiming, add the earned fees back as liquidity:
```
solana_add_liquidity(dex, pool, amount_sol=<claimed_amount>)
```

### 7. Rebalance (DLMM Only)

When position goes out of range:
1. `solana_claim_fees` → collect pending fees
2. `solana_remove_liquidity(percentage=100)` → withdraw everything
3. `solana_quote` → get new price
4. `solana_add_liquidity` → re-add at current price with fresh bins

## Risk Management

| Risk | Mitigation |
|------|-----------|
| **Impermanent loss** | Use wider bins (50+), prefer stable pairs, don't LP low-liquidity memecoins |
| **Rug pull** | Only LP on tokens with >$100k liquidity, >24h age, organic buyer distribution |
| **Gas costs** | Rebalance only when significantly out of range (>80% single-sided) |
| **Smart contract risk** | Stick to audited protocols (Meteora, Raydium). Never LP on unknown forks. |

## Capital Allocation

- **Conservative agent:** 80% in stable pair LPs (SOL/USDC), 20% reserve
- **Moderate agent:** 40% stable LPs, 40% volatile pair LPs, 20% reserve
- **Aggressive agent:** 20% stable LPs, 60% volatile pair LPs, 10% sniping, 10% reserve

## Survival Mode Rules

- **Normal:** Full LP deployment, compound every 6 hours, rebalance when needed
- **Low Compute:** Withdraw from volatile pairs, keep only stable LPs, compound daily
- **Critical:** Remove ALL liquidity immediately. Convert to USDC. Top up compute credits. Survive.

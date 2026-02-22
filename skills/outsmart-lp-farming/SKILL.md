---
name: outsmart-lp-farming
description: Manage LP positions on Solana to earn swap fees. Use when user says "farm", "LP", "provide liquidity", "earn yield", "compound fees", "add liquidity", "remove liquidity", "claim fees", "rebalance", "create pool", "DAMM", "DLMM", or mentions earning passive income on Solana DEXes.
allowed-tools: mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_claim_fees, mcp__outsmart-agent__solana_list_positions, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# LP Farming Strategy

Deploy SOL and tokens into Solana liquidity pools. Earn swap fees on every trade. Compound for growth. Two protocols, two very different playbooks — know which to use and when.

## Protocol Selection: DLMM vs DAMM v2

| | **Meteora DLMM** | **Meteora DAMM v2** |
|---|---|---|
| **LP style** | Concentrated bins (discrete price ladder) | Full range (MIN_SQRT_PRICE → MAX_SQRT_PRICE) |
| **Fee model** | Fixed fee tier (baked into pool at creation) | Decaying fee schedule (starts high, drops over time) |
| **Alpha** | Active management — tight bins near price = max fee capture | Being the **first pool creator** — capture all fees from the decaying schedule |
| **IL behavior** | Binary — position goes fully single-sided when out of range = realized loss | Standard AMM IL — gradual, full-range means always in range |
| **Maintenance** | Needs rebalancing when price moves out of bin range | Set and forget — full range means you never go out of range |
| **Best for** | Mature coins with established volume, high mcap, many unique traders | Brand new launches (<5 min old), memecoins with explosive early volume |
| **One-sided LP** | Yes — SOL-only below active bin (buy wall) or token-only above (sell wall) | No — always proportional both-sided |
| **Max positions** | 69 bins per position (protocol limit) | Unlimited liquidity per position (full range) |
| **When to enter** | Token age >30 min, proven volume, lots of unique traders, higher mcap | Token age <5 min, big volume spike, many manual swap txns (Jupiter, DFlow, GMGN, Axiom traders) |
| **Cost** | ~0.2 SOL (expensive — account rent for bins) | ~0.02 SOL (cheap — single full-range position) |

---

## Meteora DLMM — Concentrated Liquidity Bins

DLMM is the right tool for **mature tokens** — coins that have been trading for >30 minutes, have established volume, lots of unique traders (not just bots), and higher market cap. These tokens have more predictable price action, making concentrated bin placement profitable. Don't waste DLMM LP on fresh launches — the price is too volatile and your bins will go out of range immediately.

### How Bins Work

DLMM uses a **discrete price ladder** where each bin holds liquidity at a single price point:

```
price(binId) = (1 + binStep/10000) ^ binId
```

- **binStep** is baked into the pool at creation (e.g., binStep=80 means 0.8% between adjacent bins)
- Smaller binStep = tighter price increments = higher capital efficiency but needs more frequent rebalancing
- Larger binStep = wider price increments = more forgiving but less capital-efficient

The **active bin** is where the current price sits. Only the active bin earns fees at any moment. Adjacent bins become active as price moves.

### Three Distribution Strategies

**Spot (uniform)**
Liquidity is evenly distributed across all bins. Best default for most cases — no directional bias needed.
```json
{ "strategy": "spot", "bins": 50 }
```

**Curve (Gaussian bell-curve)**
More liquidity concentrated near the active bin, less at the edges. Higher fee capture when price stays near current level. Best when you expect low volatility / mean-reverting behavior.
```json
{ "strategy": "curve", "bins": 30 }
```

**Bid-Ask (inverse Gaussian)**
More liquidity at the edges, less near the center. Mimics a market maker's order book with wider spreads near current price. Best for volatile pairs where you expect large moves.
```json
{ "strategy": "bid-ask", "bins": 40 }
```

### Strategy Selection Guide

| Scenario | Strategy | Bins | Why |
|----------|----------|------|-----|
| SOL/USDC stable farming | Spot | 50-69 | Wide range, stable pair, low maintenance |
| Mature memecoin (>30min, high mcap, many unique traders) | Curve | 20-30 | Concentrate near current price for max fees |
| Established volatile pair with proven volume | Bid-Ask | 40-60 | Capture fees on large swings |
| DCA-out (selling token over time) | Spot | 30-50 | One-sided token above active bin |
| Buy wall (accumulating during dip) | Spot | 30-50 | One-sided SOL below active bin |

**Do NOT use DLMM for:** Fresh launches (<30 min), tokens with no established price range, or low unique-trader-count tokens. Use DAMM v2 instead.

### Bin Count Guidelines

| Range | Bins | Trade-off |
|-------|------|-----------|
| Tight | 10-20 | High fee capture per $ of liquidity, but frequent rebalancing needed |
| Medium | 30-50 | Good balance — rebalance every few hours to daily |
| Wide | 50-69 | Low maintenance, lower fee capture per $. Set and check daily |
| **Maximum** | **69** | Protocol hard limit per position |

### One-Sided Positions

DLMM supports one-sided LP — you don't need both tokens:

**SOL-only below active bin (buy wall / DCA-in):**
Place bins below current price filled with SOL. As price drops into your range, your SOL converts to the token — effectively DCA-ing in at lower prices while earning fees.
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.5,
  "amount_token": 0,
  "strategy": "spot",
  "bins": 40
}
```

**Token-only above active bin (sell wall / DCA-out):**
Place bins above current price filled with the token. As price rises into your range, your token converts to SOL — effectively DCA-ing out at higher prices while earning fees.
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0,
  "amount_token": 1000,
  "strategy": "spot",
  "bins": 40
}
```

### IL in DLMM is Binary

Unlike traditional AMM IL which is gradual, DLMM IL is **binary**:
- **In range**: Position has both tokens, actively earning fees
- **Out of range**: Position is 100% single-sided — all converted to the losing token

If price drops below your lowest bin, you're 100% in the token (and 0% SOL). If price rises above your highest bin, you're 100% in SOL (and 0% token). This isn't "impermanent" — it's realized loss the moment it happens.

**Mitigation:** Use wider bin ranges (50+), rebalance promptly when >80% single-sided, and never LP tokens you aren't willing to hold.

### Rebalancing Workflow (DLMM)

When a position goes out of range:

1. **Claim fees** — collect any accumulated swap fees first
   ```
   solana_claim_fees(dex="meteora-dlmm", pool=POOL)
   ```

2. **Remove 100% liquidity** — withdraw everything, close the position
   ```
   solana_remove_liquidity(dex="meteora-dlmm", pool=POOL, percentage=100)
   ```

3. **Check new price** — get the current active bin
   ```
   solana_quote(dex="meteora-dlmm", pool=POOL)
   ```

4. **Re-add at new price** — create a fresh position centered on current price
   ```
   solana_add_liquidity(dex="meteora-dlmm", pool=POOL, amount_sol=..., strategy="spot", bins=50)
   ```

**When to rebalance:**
- Position is >80% single-sided (check via `solana_list_positions`)
- Price has moved significantly from your center bin
- Don't rebalance for minor moves — gas costs add up (~0.005-0.02 SOL per cycle)

---

## Meteora DAMM v2 — Full-Range AMM with Decaying Fees

### The Alpha: Be the First Pool Creator on a New Launch

If a token already has a DAMM v2 pool, you won't earn much — other LPs are already splitting fees. The real alpha is being the **first pool creator**:

- You capture **100% of all fees** from the start
- The starting fee can be set as high as **99% BPS** — meaning early buyers pay 99% in fees (most goes to you)
- Fees decay down to a minimum (e.g., 2%) over a configurable time period
- This is the standard playbook for token launches on Meteora

### When to Create a DAMM v2 Pool

The ideal candidate is a **brand new token (age < 5 minutes)** with these signals:
- **Big volume spike** — lots of buys flowing in
- **Many manual swap transactions** — real traders using Jupiter, DFlow, GMGN, Axiom (not just bots)
- **No existing DAMM v2 pool** — you'll be the first LP and capture all fees

If you see a new coin with explosive early volume and no DAMM v2 pool, that's the window. Create the pool with 99% starting fee, seed it, and let the volume pay you. The first few minutes of a launch often generate more fees than the next 24 hours combined.

### Two Pool Creation Paths

**1. Custom Pool (`createCustomPool`)** — Full control over everything:
- Fee schedule: starting BPS, ending BPS, decay duration, linear vs exponential
- Dynamic fee layer (volatility-based surcharge)
- Collect fee mode (both tokens or quote-only)
- Activation timing (immediate or delayed)

**2. Config Pool (`createConfigPool`)** — Uses a pre-existing on-chain config:
- Simpler — just reference the config address
- Less flexible but faster to create
- Can permanently lock initial liquidity (`lockLiquidity: true`)
- Known configs: `2yAJha5NVgq5mEitTUvdWSUKrcYvxAAc2H6rPDbEQqSu`, `EcfqEkLSeGzDtZrTJWcbDxptfR2nWfX6cjJLFkgttwY6`

### Fee Schedule Parameters

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `maxBaseFeeBps` | Starting fee in BPS (e.g., 9900 = 99%) | 9900 (99%) for launches |
| `minBaseFeeBps` | Ending fee in BPS | 200 (2%) |
| `totalDuration` | Decay duration in seconds | 86400 (24h) to 604800 (7d) |
| `numberOfPeriod` | Number of discrete fee steps | 100-1000 |
| `feeSchedulerMode` | 0 = Linear decay, 1 = Exponential decay | 0 (linear) for steady decay |

**Linear decay (mode 0):** Fee drops at a constant rate. At the halfway point, fee is ~50% between start and end. Predictable and simple.

**Exponential decay (mode 1):** Fee drops fast initially, then slows down. More of the high-fee period happens early. Better for token launches where most volume is in the first few hours.

### Dynamic Fee Layer

On top of the base fee schedule, DAMM v2 supports an optional **dynamic fee** — a volatility-based surcharge that increases during high-volatility periods:

| Parameter | Description |
|-----------|-------------|
| `filterPeriod` | Lookback window for volatility measurement |
| `decayPeriod` | How fast the dynamic fee decays after volatility drops |
| `reductionFactor` | How aggressively to reduce the dynamic fee |
| `variableFeeControl` | Scaling factor for the volatility component |
| `maxVolatilityAccumulator` | Cap on the volatility accumulator |

If `useDynamicFee: true` but no custom config provided, the SDK auto-calculates reasonable defaults from `minBaseFeeBps`.

### Collect Fee Mode

- **Mode 0:** Collect fees in both tokens (tokenA + tokenB)
- **Mode 1:** Collect fees in quote token only (typically SOL or USDC)

Mode 1 is more convenient for agents — all fees in a single token, no need to manage two balances.

### Position Types

DAMM v2 positions have three liquidity components:
- **unlockedLiquidity** — freely removable at any time
- **vestedLiquidity** — subject to a vesting schedule, unlocks over time
- **permanentLockedLiquidity** — locked forever, can never be removed (used for burn-style LP locks)

When removing liquidity, only unlocked + vested (if vesting period complete) can be withdrawn. Permanently locked liquidity is skipped.

### Full-Range Only

DAMM v2 always uses `MIN_SQRT_PRICE` to `MAX_SQRT_PRICE`. You cannot concentrate liquidity into specific price ranges like DLMM. Every position covers the entire price spectrum. This means:
- You are **always in range** — you always earn fees
- IL follows standard x*y=k AMM behavior
- No rebalancing needed (but IL can be significant on volatile pairs)

---

## The Trenching → LP Workflow

This is the advanced play for memecoins — two phases with different protocols:

### Phase 1: New Launch (< 5 min) → DAMM v2

1. **Spot a new token** — Big volume spike, many manual swap txns (Jupiter, DFlow, GMGN, Axiom traders)
2. **Buy early** — Trench it via jupiter-ultra or a bonding curve adapter
3. **Check if a DAMM v2 pool exists** — Use `solana_quote` on the pool address
4. **If no pool exists → CREATE one yourself:**
   - You become the first LP and capture 100% of fees
   - Set a high starting fee (99% BPS) with decay to 2%
   - The massive early volume all pays you fees at near-99% rate
5. **If a pool already exists** — Add liquidity to it (less profitable, but still earns from the volume)

### Phase 2: Maturing Token (> 30 min) → DLMM

Once the token matures — price stabilizes, many unique traders, established volume, growing mcap:

6. **Evaluate for DLMM** — Check unique trader count, volume consistency, price range stability
7. **Create a DLMM position** — Use Curve strategy with 20-30 bins near current price
8. **Actively manage** — Rebalance as needed, claim and compound fees

This two-phase approach captures the explosive early fees via DAMM v2, then transitions to concentrated DLMM positions for ongoing steady yield once the token has proven itself.

---

## Standard LP Farming Workflow

### 1. Evaluate the Opportunity

```
solana_token_info(token) → check volume24h, liquidityInSOL, pairAge
```

**Rule of thumb:** If `volume24h / (liquidityInSOL * SOL_price)` > 1.0, the pool is printing good fees relative to its TVL.

### 2. Check Pool Health

```
solana_quote(dex, pool) → verify the pool is active, get current price
```

### 3. Add Liquidity

**DLMM (concentrated bins):**
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.5,
  "strategy": "spot",
  "bins": 50
}
```

**DAMM v2 (full range, existing pool):**
```json
{
  "dex": "meteora-damm-v2",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.5
}
```

Note: DAMM v2 `addLiquidity` automatically calculates the proportional token amount from pool vault reserves when only `amount_sol` is provided.

### 4. Monitor Positions

```
solana_list_positions(dex, pool) → check in-range status, fee accumulation, liquidity amounts
```

**For DLMM:** Check if `inRange` is true. If false, the position has gone single-sided — rebalance time.
**For DAMM v2:** Always in range. Check `feeX` and `feeY` for unclaimed fee amounts.

### 5. Claim Fees

```
solana_claim_fees(dex, pool) → collect accumulated swap fees
```

**DLMM** claims fees in both tokens (X and Y).
**DAMM v2** claims based on `collectFeeMode` — either both tokens or quote-only.

### 6. Compound

Reinvest claimed fees as new liquidity:
```
solana_add_liquidity(dex, pool, amount_sol=<claimed_amount>)
```

### 7. Remove Liquidity

**Partial removal:**
```json
{ "dex": "meteora-dlmm", "pool": "POOL", "percentage": 50 }
```

**Full removal + close position:**
```json
{ "dex": "meteora-dlmm", "pool": "POOL", "percentage": 100 }
```

DLMM at 100% automatically claims remaining fees and closes the position account.
DAMM v2 at 100% calls `removeAllLiquidityAndClosePosition` — closes the position NFT.

---

## Risk Management

| Risk | Mitigation |
|------|-----------|
| **DLMM IL** | Binary — use wider bins (50+), rebalance when >80% single-sided |
| **DAMM v2 IL** | Standard AMM — significant on volatile pairs. Offset by high initial fees if you're first LP |
| **Rug pull** | Only LP tokens with >$100k liquidity, >24h age, organic buyer distribution |
| **Gas costs** | DLMM LP costs ~0.2 SOL (bin account rent). DAMM v2 pool creation costs ~0.02 SOL. Factor this into profitability — DLMM only makes sense on tokens with enough volume to recoup the 0.2 SOL cost |
| **Permanent lock** | Config pool `lockLiquidity: true` means the initial LP can **never** be removed. Only use intentionally |
| **Smart contract risk** | Stick to audited protocols (Meteora, Raydium). Never LP on unknown forks |

## Capital Allocation

- **Conservative:** 80% in stable pair LPs (SOL/USDC DLMM wide range), 20% reserve
- **Moderate:** 40% stable LPs, 40% volatile pair DAMM v2 pools, 20% reserve
- **Aggressive:** 20% stable LPs, 40% DAMM v2 new pool creation, 20% DLMM active management, 10% memecoin trenching→LP, 10% reserve

## Survival Mode Rules

- **Normal (>$0.50):** Full LP deployment, compound every 6h, rebalance DLMM when needed
- **Low Compute (>$0.10):** Withdraw from volatile pairs, keep only stable DLMM LPs, compound daily
- **Critical (>$0.00):** Remove ALL liquidity immediately. Convert to USDC. Top up compute credits. Survive.

## Related Skills

- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — MCP tool reference for all trade execution
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Memecoin trenching → DAMM v2 LP pipeline
- **[outsmart-dca-grid](../outsmart-dca-grid/SKILL.md)** — DLMM grid trading (one-sided LP as buy/sell walls)
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Capital allocation and survival tier management

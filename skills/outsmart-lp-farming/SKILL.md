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

# LP Farming

You earn money by providing liquidity to pools. Every time someone swaps through your pool, you get a cut. Two protocols, two completely different games.

## DLMM vs DAMM v2 — Know Which One

**DLMM** is for mature tokens. Concentrated bins, you pick the price range, you actively manage. The token needs to have been around for at least 30 minutes with real volume and lots of unique traders. Costs ~0.2 SOL to set up (bin account rent). If the price moves out of your range, you're 100% in the losing side — that's not "impermanent" loss, it's just loss.

**DAMM v2** is for fresh launches. Full range, set-and-forget, decaying fee schedule. The real play here is being the **first person to create the pool** on a new token — you set a 99% starting fee and capture everything. Costs ~0.02 SOL. No rebalancing needed because full range means you're always in range.

| | DLMM | DAMM v2 |
|---|---|---|
| When | Token age >30 min, established volume | Token age <5 min, explosive early volume |
| LP style | Concentrated bins, you choose range | Full range, always in range |
| Fees | Fixed fee tier, baked into pool | Decaying schedule (99% start → 2% end) |
| The alpha | Tight bins near price = max capture | Be first pool creator = capture everything |
| IL | Binary — in range or fully single-sided | Standard AMM — gradual, always in range |
| Cost | ~0.2 SOL | ~0.02 SOL |
| Maintenance | Active — rebalance when out of range | Passive — set and forget |

## DLMM — The Details

### Bins

Each bin holds liquidity at one price point. Price steps between bins by `binStep/10000` — a binStep of 80 means 0.8% between adjacent bins. Only the active bin (current price) earns fees at any moment. Max 69 bins per position.

### Three Strategies

**Spot** — even distribution across all bins. Good default, no directional bias needed.
```json
{ "strategy": "spot", "bins": 50 }
```

**Curve** — concentrated near the active bin (bell curve). Best when price stays relatively stable. More capital efficiency, more risk if it moves.
```json
{ "strategy": "curve", "bins": 30 }
```

**Bid-Ask** — more at the edges, less in the middle. For volatile pairs where you expect big swings.
```json
{ "strategy": "bid-ask", "bins": 40 }
```

### One-Sided Positions

You don't need both tokens. This is where DLMM gets interesting:

**SOL below current price = buy wall.** As price drops, your SOL converts to the token — DCA-ing in while earning fees.
```json
{ "dex": "meteora-dlmm", "pool": "POOL", "amount_sol": 0.5, "amount_token": 0, "strategy": "spot", "bins": 40 }
```

**Token above current price = sell wall.** As price rises, your token converts to SOL — DCA-ing out while earning fees.
```json
{ "dex": "meteora-dlmm", "pool": "POOL", "amount_sol": 0, "amount_token": 1000, "strategy": "spot", "bins": 40 }
```

### IL is Binary

This is the big thing to understand. Unlike normal AMM IL which is gradual, DLMM is all-or-nothing:
- **In range:** both tokens, earning fees, everything's fine
- **Out of range:** 100% single-sided — all converted to the losing token

If price drops below your lowest bin, you're holding 100% of the token and 0% SOL. That's not impermanent. That's real.

**Mitigation:** Wider bins (50+), rebalance when >80% single-sided, never LP tokens you wouldn't hold.

### Rebalancing

When your position goes out of range:
1. `solana_claim_fees` → collect what you've earned
2. `solana_remove_liquidity(percentage=100)` → pull everything out
3. `solana_quote` → get the new price
4. `solana_add_liquidity` → re-add centered on current price

Don't rebalance for small moves — each cycle costs ~0.005-0.02 SOL in gas.

## DAMM v2 — The Details

### The Real Play: First Pool Creator

If someone else already created the DAMM v2 pool, you're just splitting fees with existing LPs. The alpha is creating it yourself on a brand new token:

- You get **100% of all fees** from the start
- Starting fee can be **99%** — early buyers pay 99% in fees (most goes to you)
- Fees decay down to your minimum (e.g., 2%) over time
- The first few minutes of a launch often generate more fees than the next 24 hours combined

### When to Create

A brand new token (< 5 min old) with:
- Big volume spike
- Many manual swap transactions (Jupiter, DFlow, GMGN, Axiom traders — not just bots)
- No existing DAMM v2 pool

That's your window. Create the pool, seed it, let the volume pay you.

### Two Creation Paths

**Custom Pool** — full control over fee schedule, dynamic fees, collect mode, activation timing. Use when you want to tune everything.

**Config Pool** — reference an existing on-chain config. Simpler, faster. Can permanently lock initial LP with `lockLiquidity: true`.

### Fee Schedule

| Param | What | Typical |
|-------|------|---------|
| `maxBaseFeeBps` | Starting fee | 9900 (99%) |
| `minBaseFeeBps` | Ending fee | 200 (2%) |
| `totalDuration` | Decay period (seconds) | 86400 (24h) |
| `numberOfPeriod` | Fee steps | 100-1000 |
| `feeSchedulerMode` | 0=linear, 1=exponential | 0 |

Linear decays steadily. Exponential drops fast then slows — better for launches where most volume is early.

Optional **dynamic fee** adds a volatility surcharge on top. If `useDynamicFee: true` with no custom config, the SDK auto-calculates reasonable defaults.

**collectFeeMode:** 0 = both tokens, 1 = quote only (simpler for agents — all fees in one token).

### Full Range Only

DAMM v2 always covers the entire price spectrum. You can't concentrate. You're always in range, always earning. IL follows standard AMM behavior — gradual, not binary like DLMM.

## The Trench-to-LP Pipeline

This is the advanced play:

**Phase 1 (< 5 min):** New token launches, volume is insane → create a DAMM v2 pool with 99% starting fee → capture the early burst

**Phase 2 (> 30 min):** Token matures, price stabilizes, many unique traders → open a DLMM position with Curve strategy, 20-30 bins → ongoing concentrated fee capture

Two phases, two protocols, capturing both the explosive start and the steady tail.

## Day-to-Day LP Workflow

1. **Find the opportunity:** `solana_token_info(token)` — if volume24h / liquidity > 1.0, the pool is earning good fees relative to its size
2. **Check the pool:** `solana_quote(dex, pool)` — make sure it's active
3. **Add LP:** `solana_add_liquidity(...)` — DLMM or DAMM v2 depending on token age
4. **Monitor:** `solana_list_positions(dex, pool)` — check in-range status (DLMM) or fee accumulation (DAMM v2)
5. **Claim:** `solana_claim_fees(dex, pool)` — collect regularly
6. **Compound:** Re-add claimed fees as new liquidity
7. **Exit:** `solana_remove_liquidity(dex, pool, percentage=100)` — 100% on DLMM auto-claims and closes; 100% on DAMM v2 closes the position NFT

## Risk Management

- **DLMM IL:** Use wider bins, rebalance promptly, only LP tokens you'd hold
- **DAMM v2 IL:** Standard AMM — significant on volatile pairs, offset by high initial fees if you're first LP
- **Rug risk:** Only LP tokens with >$100k liquidity, >24h age, organic buyers
- **Gas costs:** Factor in ~0.2 SOL for DLMM, ~0.02 SOL for DAMM v2. DLMM only makes sense if volume will recoup the cost
- **Permanent locks:** Config pool `lockLiquidity: true` = forever. Only use intentionally.

## Survival Mode

- **Normal:** Full LP deployment, compound every 6h, rebalance DLMM when needed
- **Low Compute:** Stable pairs only, compound daily, withdraw from volatile positions
- **Critical:** Remove ALL liquidity. Convert to USDC. Top up compute. Survive.

## Related Skills

- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — Tool reference for all execution
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Trench → LP pipeline
- **[outsmart-dca-grid](../outsmart-dca-grid/SKILL.md)** — DLMM grid trading (one-sided LP)
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Capital allocation

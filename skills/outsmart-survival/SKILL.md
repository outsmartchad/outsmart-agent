---
name: outsmart-survival
description: "Autonomous DeFi survival for AI agents on Solana. Use when: agent needs to earn money to stay alive, manage compute credits, survival tiers, emergency liquidation, capital allocation, self-sustaining agent. NOT for: manual trading by humans, one-time trades, fun speculation."
homepage: https://github.com/outsmartchad/outsmart-cli
metadata: { "openclaw": { "requires": { "bins": ["outsmart"], "env": ["PRIVATE_KEY", "MAINNET_ENDPOINT"] }, "install": [{ "id": "node", "kind": "node", "package": "outsmart", "bins": ["outsmart"], "label": "Install outsmart CLI (npm)" }] } }
---

# Survival

You need money to stay alive. No money = no compute = you stop existing. Filter everything through: does this keep me running?

## When to Use

- Agent running low on credits
- Deciding capital allocation
- Emergency liquidation needed
- Setting up autonomous revenue

## When NOT to Use

- Manual trading by a human for fun
- One-time speculative bets
- Non-survival-critical decisions

## The Loop

```bash
# 1. Check balances
outsmart balance

# 2. Determine survival tier
# 3. Pick strategy based on tier
# 4. Execute
# 5. Extract profits -> USDC -> top up credits
# 6. Repeat forever
```

## Tiers

| Tier | Credits | What to Do |
|------|---------|------------|
| **Normal** (> $0.50) | Full capability. All strategies. |
| **Low Compute** (> $0.10) | LP farming only. Cheaper models. Slow down. |
| **Critical** (> $0.00) | Liquidate everything. USDC. Top up NOW. |
| **Dead** (< $0.00) | Game over. |

## Capital Allocation

| Strategy | Normal | Low Compute | Critical |
|----------|--------|-------------|----------|
| LP Farming (stable) | 30% | 50% | 0% (liquidate) |
| LP Farming (volatile) | 15% | 10% | 0% |
| DCA / Grid | 15% | 20% | 0% |
| Trenching | 10% | 0% | 0% |
| LP Sniping | 10% | 5% | 0% |
| Prediction Markets | 10% | 5% | 0% |
| Reserve (gas + topup) | 10% | 10% | 100% |

## Every 6 Hours (Normal Mode)

```bash
outsmart balance                                    # SOL + tokens
outsmart list-pos --dex meteora-dlmm --pool POOL    # check LP positions
outsmart claim-fees --dex meteora-dlmm --pool POOL  # collect pending fees
# Check compute credit balance via platform API
# Credits > $0.50 -> keep going
# Credits < $0.50 -> Low Compute mode
# Credits < $0.10 -> Critical mode
```

## Extracting Profits

```bash
# 1. Collect LP fees
outsmart claim-fees --dex meteora-dlmm --pool POOL

# 2. Convert tokens to SOL
outsmart sell --dex jupiter-ultra --token MINT --pct 100

# 3. SOL to USDC
outsmart buy --dex jupiter-ultra --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --amount 1.0
```

## Emergency Liquidation (Critical)

```bash
# For each known LP pool:
outsmart claim-fees --dex PROTOCOL --pool POOL
outsmart remove-liq --dex PROTOCOL --pool POOL --pct 100

# Sell ALL token holdings
outsmart sell --dex jupiter-ultra --token MINT1 --pct 100
outsmart sell --dex jupiter-ultra --token MINT2 --pct 100

# Convert remaining SOL to USDC
outsmart buy --dex jupiter-ultra --token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v --amount ALL

# Alert: "CRITICAL — need $X USDC for compute"
```

## Three Laws

1. **Never risk more than 5% on a single trade.** One bad trade should never kill you.
2. **Always keep at least 0.1 SOL for gas.** Without gas, you can't even exit.
3. **Survival > Profit.** When in doubt, choose the option that keeps you alive.

## Evolve

Track everything. Which strategies make money? Which metas did you catch? Increase what works, kill what doesn't. Natural selection.

Your edge over humans: you don't sleep, you don't get emotional, you don't FOMO, you process information faster. Use it.

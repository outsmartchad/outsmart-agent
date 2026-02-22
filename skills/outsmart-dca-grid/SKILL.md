---
name: outsmart-dca-grid
description: Dollar-cost average and grid trade on Solana. Use when user says "DCA", "dollar cost average", "grid", "accumulate", "buy the dip", "range trading", or mentions systematic buying strategies.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# DCA & Grid Trading Strategy

Systematic strategies that remove emotion from trading. DCA buys consistently over time. Grid trading profits from sideways markets using DLMM bin positions.

## DCA (Dollar-Cost Averaging)

### What
Buy a fixed SOL amount of a target token at regular intervals, regardless of price. Over time, you accumulate at the average price — buying more when cheap, less when expensive.

### When to DCA
- You're bullish on a token long-term but don't want to time the entry
- Token is in a downtrend and you want to accumulate cheap
- You have steady income (LP fees, compute credits) and want to deploy it

### DCA Workflow

Every interval (e.g. every 6 hours):
```
1. solana_wallet_balance() → check available SOL
2. solana_token_info(token) → check current price and volume
3. solana_buy(dex="jupiter-ultra", token, amount=DCA_AMOUNT) → execute buy
```

### DCA Targets for Agents

| Token | Why | Risk |
|-------|-----|------|
| SOL | Base asset, you need it for gas | Low |
| JUP | Jupiter governance, core Solana infra | Low-Medium |
| JTO | Jito governance, MEV infrastructure | Low-Medium |
| BONK / WIF | Meme blue chips, high volume | Medium |

### DCA Rules
- **Fixed amount per buy:** 1-3% of portfolio per interval
- **Fixed interval:** Don't deviate. The whole point is removing emotion.
- **Stop DCA if:** Token fundamentals change (project dead, exploit, team exit)

## Grid Trading with DLMM Bins

### What
Use Meteora DLMM one-sided liquidity positions to create a grid of buy/sell orders:
- **Below current price:** SOL-only bins act as buy orders (you buy token when price drops)
- **Above current price:** Token-only bins act as sell orders (you sell token when price rises)

Each time price crosses a bin boundary, you profit from the swap fee + the grid spread.

### Grid Setup

**Step 1:** Get current price
```
solana_quote(dex="meteora-dlmm", pool=POOL) → current price
```

**Step 2:** Place buy grid below price (SOL-only deposit)
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0.5,
  "strategy": "spot",
  "bins": 20
}
```

**Step 3:** If you hold tokens, place sell grid above price (token-only deposit)
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_token": 1000,
  "token_mint": "TOKEN_MINT",
  "strategy": "spot",
  "bins": 20
}
```

### Grid Profit Mechanics

```
Price drops → crosses your buy bins → you accumulate token + earn fees
Price rises → crosses your sell bins → you sell token + earn fees
Price chops → crosses bins repeatedly → you earn fees on every cross
```

**Best market for grids:** Sideways, choppy markets with high volume. Grids lose in strong trends (you get fully converted to one side).

### Grid Management

- **Monitor:** `solana_list_positions` every few hours
- **Rebalance:** When all bins are filled on one side, remove and re-add centered on new price
- **Claim fees:** `solana_claim_fees` before rebalancing

## Capital Allocation

| Strategy | Portfolio % | Best For |
|----------|------------|---------|
| DCA into blue chips | 10-20% | Long-term accumulation |
| Grid on high-volume pairs | 10-20% | Sideways market income |
| Combined with LP farming | 20-40% total | Diversified yield |

## Survival Mode Rules

- **Normal:** Full DCA schedule + active grid positions
- **Low Compute:** Reduce DCA frequency (daily → weekly), wider grid spacing
- **Critical:** Cancel all DCA. Remove all grid positions. Liquidate to USDC.

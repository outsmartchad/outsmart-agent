---
name: outsmart-dca-grid
description: Dollar-cost average and grid trade on Solana. Use when user says "DCA", "dollar cost average", "grid", "accumulate", "buy the dip", "range trading", "recurring", or mentions systematic buying strategies.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# DCA & Grid Trading Strategy

Systematic strategies that remove emotion from trading. Two approaches: Jupiter's automated DCA (set-and-forget) and DLMM grid trading (active bin-based market making).

## DCA (Dollar-Cost Averaging)

### Two Ways to DCA on Solana

**1. Jupiter Recurring API (Recommended — automated)**

Jupiter provides a native DCA service via the Recurring API. You create an order once, and Jupiter's keeper bots execute the swaps automatically on schedule. No agent loop needed.

| Feature | Detail |
|---------|--------|
| **API** | `POST /recurring/v1/createOrder` |
| **Fee** | 0.1% per swap |
| **Scheduling** | Time-based (every N seconds/minutes/hours) |
| **Price strategy** | Optional price range filter (only buy within a price band) |
| **Token support** | Any pair on Jupiter's Metis routing engine (Token-2022 NOT supported) |
| **Execution** | Keeper bots handle it — you sign once, it runs automatically |
| **Cancellation** | `POST /recurring/v1/cancelOrder` — returns remaining funds |
| **Monitoring** | `GET /recurring/v1/getRecurringOrders` — check status, filled cycles |

**Jupiter DCA flow:**
1. Call `/recurring/v1/createOrder` with: inputMint, outputMint, amount per cycle, cycle frequency, number of cycles
2. Sign the returned Solana transaction
3. Jupiter keeper bots execute each cycle automatically
4. Check status via `/recurring/v1/getRecurringOrders`
5. Cancel anytime via `/recurring/v1/cancelOrder`

**Best for:** Long-term accumulation of blue chips (SOL, JUP, JTO). Set it and forget it.

**2. Manual DCA via outsmart (Agent-controlled)**

Execute buys yourself at regular intervals using `solana_buy`. More control but requires your agent to stay online and manage the schedule.

```
Every interval (e.g. every 6 hours):
1. solana_wallet_balance() → check available SOL
2. solana_token_info(token) → check current price and volume
3. solana_buy(dex="jupiter-ultra", token, amount=DCA_AMOUNT) → execute buy
```

**Best for:** When you want conditional logic (e.g., only buy if RSI < 30, or skip if gas is expensive), or when DCA-ing into tokens not supported by Jupiter Recurring.

### When to DCA
- You're bullish on a token long-term but don't want to time the entry
- Token is in a downtrend and you want to accumulate cheap
- You have steady income (LP fees, compute credits) and want to deploy it systematically
- You want to reduce volatility impact on your average entry price

### DCA Targets for Agents

| Token | Why | Risk |
|-------|-----|------|
| SOL | Base asset, you need it for gas and LP | Low |
| JUP | Jupiter governance, core Solana infra | Low-Medium |
| JTO | Jito governance, MEV infrastructure | Low-Medium |
| BONK / WIF | Meme blue chips, high volume, deep liquidity | Medium |

### DCA Rules
- **Fixed amount per buy:** 1-3% of portfolio per interval
- **Fixed interval:** Don't deviate. The whole point is removing emotion.
- **Prefer Jupiter Recurring API** for set-and-forget accumulation of known tokens
- **Use manual DCA** only when you need conditional logic or unsupported tokens
- **Stop DCA if:** Token fundamentals change (project dead, exploit, team exit)

## Grid Trading with DLMM Bins

### What
Use Meteora DLMM one-sided liquidity positions to create a grid of buy/sell orders:
- **Below current price:** SOL-only bins act as buy orders (you buy token when price drops)
- **Above current price:** Token-only bins act as sell orders (you sell token when price rises)

Each time price crosses a bin boundary, you profit from the swap fee + the grid spread.

**Important:** DLMM LP costs ~0.2 SOL in account rent. Only use grid trading on tokens with enough volume to justify this cost. Grid trading is for **mature tokens** with established volume, many unique traders, and stable price ranges — NOT fresh launches.

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
  "amount_token": 0,
  "strategy": "spot",
  "bins": 20
}
```

**Step 3:** If you hold tokens, place sell grid above price (token-only deposit)
```json
{
  "dex": "meteora-dlmm",
  "pool": "POOL_ADDRESS",
  "amount_sol": 0,
  "amount_token": 1000,
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

**Best market for grids:** Sideways, choppy markets with high volume. Grids lose in strong trends (you get fully converted to one side — this is the binary IL of DLMM).

### Strategy Selection for Grids

| Market Condition | Strategy | Bins | Why |
|-----------------|----------|------|-----|
| Tight range, high volume | Curve | 15-25 | Concentrate near price for max fee capture |
| Wide range, moderate volume | Spot | 30-50 | Even distribution, more forgiving |
| Expecting large moves | Bid-Ask | 40-60 | More liquidity at edges to catch swings |

### Grid Management

- **Monitor:** `solana_list_positions` every few hours — check if still in range
- **Rebalance:** When all bins are filled on one side (100% single-sided), remove and re-add centered on new price
- **Claim fees:** `solana_claim_fees` before rebalancing — always collect first
- **Cost awareness:** Each rebalance cycle costs ~0.01-0.02 SOL in gas. Don't rebalance for small moves.

## Combining DCA + Grid

The most powerful setup combines both strategies:

1. **Jupiter Recurring DCA** accumulates a blue-chip token on autopilot (e.g., buy $5 of JUP every 6 hours)
2. **DLMM grid** earns fees on the same token pair by providing liquidity around the current price
3. **Claimed grid fees** get recycled into more DCA buys or grid deposits

This creates a self-reinforcing loop: DCA builds position → grid earns fees → fees fund more DCA.

## Capital Allocation

| Strategy | Portfolio % | Best For |
|----------|------------|---------|
| Jupiter DCA into blue chips | 10-20% | Long-term accumulation, fully automated |
| Manual DCA (conditional) | 5-10% | Tokens needing custom logic |
| Grid on high-volume pairs | 10-20% | Sideways market income, mature tokens only |
| Combined with LP farming | 20-40% total | Diversified yield |

## Survival Mode Rules

- **Normal:** Full DCA schedule (Jupiter Recurring + manual) + active grid positions
- **Low Compute:** Keep Jupiter Recurring (it's automated). Reduce manual DCA frequency. Wider grid spacing, fewer rebalances.
- **Critical:** Cancel all Jupiter DCA orders. Remove all grid positions. Liquidate to USDC. Survive.

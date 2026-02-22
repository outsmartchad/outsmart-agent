---
name: outsmart-dca-grid
description: Dollar-cost average and grid trade on Solana. Use when user says "DCA", "dollar cost average", "grid", "accumulate", "buy the dip", "range trading", "recurring", or mentions systematic buying strategies.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_add_liquidity, mcp__outsmart-agent__solana_remove_liquidity, mcp__outsmart-agent__solana_claim_fees, mcp__outsmart-agent__solana_list_positions, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# DCA and Grid Trading

Two ways to take emotion out of trading. Jupiter's DCA runs on autopilot. DLMM grids earn fees while you accumulate or distribute.

## DCA — Dollar-Cost Averaging

### Jupiter Recurring (Recommended)

Set it once, Jupiter's keeper bots handle the rest. You sign one transaction, the swaps execute automatically on schedule. 0.1% fee per swap.

- `POST /recurring/v1/createOrder` — create with input/output mints, amount per cycle, frequency, number of cycles
- `GET /recurring/v1/getRecurringOrders` — check status
- `POST /recurring/v1/cancelOrder` — cancel and get remaining funds back

Best for: accumulating blue chips (SOL, JUP, JTO) without thinking about it.

### Manual DCA (Agent-Controlled)

Execute buys yourself on a schedule via `solana_buy`. More control — you can add conditions (only buy if price is below X, skip if gas is high, etc). Downside: agent needs to stay online.

```
Every 6 hours:
1. solana_wallet_balance() → check SOL
2. solana_token_info(token) → current price
3. solana_buy(dex="jupiter-ultra", token, amount) → buy
```

### DCA Rules

- Fixed amount per buy: 1-3% of portfolio
- Fixed interval — don't deviate, that defeats the purpose
- Stop if: project dies, exploit happens, team exits
- Prefer Jupiter Recurring for set-and-forget
- Use manual only when you need conditional logic

## Grid Trading with DLMM

Use one-sided DLMM positions as a grid of buy/sell orders. When price crosses a bin, you earn the swap fee + the spread.

**Important:** DLMM costs ~0.2 SOL in rent. Only worth it on tokens with enough volume to pay that back. This is for mature tokens with stable ranges — not fresh launches.

### How It Works

**SOL below current price = buy grid.** As price drops, your SOL converts to the token. You're DCA-ing in while earning fees.

```json
{ "dex": "meteora-dlmm", "pool": "POOL", "amount_sol": 0.5, "amount_token": 0, "strategy": "spot", "bins": 20 }
```

**Token above current price = sell grid.** As price rises, your token converts to SOL. DCA-ing out while earning fees.

```json
{ "dex": "meteora-dlmm", "pool": "POOL", "amount_sol": 0, "amount_token": 1000, "strategy": "spot", "bins": 20 }
```

**Price chops sideways?** Even better — you earn fees on every bin crossing.

### Strategy by Market

| Market | Strategy | Bins |
|--------|----------|------|
| Tight range, high volume | Curve | 15-25 |
| Wide range, moderate volume | Spot | 30-50 |
| Expecting big moves | Bid-Ask | 40-60 |

### Managing Grids

- Check `solana_list_positions` every few hours
- When all bins filled on one side → remove, re-add centered on new price
- Always `solana_claim_fees` before rebalancing
- Each rebalance cycle costs ~0.01-0.02 SOL — don't rebalance for small moves

## Combining Both

The strongest setup:
1. **Jupiter Recurring DCA** accumulates a token on autopilot
2. **DLMM grid** earns fees on the same pair
3. **Grid fees** fund more DCA buys

Self-reinforcing loop: DCA builds position → grid earns fees → fees fund more DCA.

## Survival Mode

- **Normal:** Full DCA + active grids
- **Low Compute:** Keep Jupiter Recurring (it's automated). Wider grids, fewer rebalances.
- **Critical:** Cancel all DCA. Remove all grids. Liquidate. Survive.

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DLMM mechanics, one-sided positions
- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — Tool reference
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Capital allocation

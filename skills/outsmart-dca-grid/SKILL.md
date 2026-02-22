---
name: outsmart-dca-grid
description: Dollar-cost average and grid trade on Solana. Use when user says "DCA", "dollar cost average", "grid", "accumulate", "buy the dip", "range trading", "recurring", or mentions systematic buying strategies.
allowed-tools: mcp__outsmart-agent__dex_buy, mcp__outsmart-agent__dex_sell, mcp__outsmart-agent__dex_add_liquidity, mcp__outsmart-agent__dex_remove_liquidity, mcp__outsmart-agent__dex_claim_fees, mcp__outsmart-agent__dex_list_positions, mcp__outsmart-agent__dex_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__jupiter_dca_create, mcp__outsmart-agent__jupiter_dca_list, mcp__outsmart-agent__jupiter_dca_cancel
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# DCA and Grid Trading

Two ways to take emotion out of trading. Jupiter's DCA runs on autopilot. DLMM grids earn fees while you accumulate or distribute.

## DCA — Dollar-Cost Averaging

### Jupiter Recurring (Recommended — Fully MCP-Executable)

Jupiter DCA is fully autonomous via MCP tools. Create orders, monitor them, cancel if needed — all from the agent.

| Tool | What It Does |
|------|-------------|
| `jupiter_dca_create` | Create a recurring DCA order (signs + submits tx) |
| `jupiter_dca_list` | List your active or historical DCA orders |
| `jupiter_dca_cancel` | Cancel an active order, returns remaining funds |

Jupiter keepers auto-execute each swap on your schedule. 0.1% fee per swap. Min 100 USDC equivalent.

Best for: accumulating blue chips (SOL, JUP, JTO) without thinking about it. Set and forget.

```
1. jupiter_dca_create(input_mint="USDC", output_mint="SOL", total_amount=500, number_of_orders=10, interval_seconds=21600)
2. jupiter_dca_list(status="active") → check progress
3. jupiter_dca_cancel(order="ORDER_PUBKEY") → cancel if needed
```

### Manual DCA (Alternative — Agent-Controlled)

Execute buys yourself on a schedule via `dex_buy`. More control — you can add conditions (only buy if price is below X, skip if gas is high, etc). Downside: agent needs to stay online.

```
Every 6 hours:
1. solana_wallet_balance() → check SOL
2. solana_token_info(token) → current price
3. dex_buy(dex="jupiter-ultra", token, amount) → buy
```

### DCA Rules

- Fixed amount per buy: 1-3% of portfolio
- Fixed interval — don't deviate, that defeats the purpose
- Stop if: project dies, exploit happens, team exits
- Prefer `jupiter_dca_create` for set-and-forget — keepers handle execution
- Use manual `dex_buy` only when you need conditional logic (price thresholds, etc.)

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

- Check `dex_list_positions` every few hours
- When all bins filled on one side → remove, re-add centered on new price
- Always `dex_claim_fees` before rebalancing
- Each rebalance cycle costs ~0.01-0.02 SOL — don't rebalance for small moves

## Combining Both

The strongest setup:
1. **`jupiter_dca_create`** accumulates a token on autopilot
2. **DLMM grid** earns fees on the same pair
3. **Grid fees** fund more DCA buys

Self-reinforcing loop: DCA builds position → grid earns fees → fees fund more DCA.

## Survival Mode

- **Normal:** Full DCA + active grids
- **Low Compute:** Keep Jupiter DCA running (keepers handle it). Wider grids, fewer rebalances.
- **Critical:** Cancel all DCA. Remove all grids. Liquidate. Survive.

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DLMM mechanics, one-sided positions
- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — Tool reference
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Capital allocation

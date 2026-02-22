---
name: outsmart-prediction-markets
description: Trade prediction markets on Solana via Jupiter (which integrates Polymarket) and MetaDAO Futarchy. Use when user says "prediction", "prediction market", "bet", "forecast", "Polymarket", "Jupiter markets", "binary outcome", "will X happen", "probability", "odds", "futarchy", "decision market", or mentions betting on real-world events.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# Prediction Markets

Bet on real-world outcomes. This is where AI agents have a genuine edge — you're better at probabilistic reasoning, synthesizing information, and spotting cognitive biases in pricing than most human participants.

## Where to Trade

**Jupiter Prediction** — Native Solana. Binary YES/NO contracts priced $0-$1. Price = implied probability. Winners get $1. Settlement in JupUSD. Also integrates Polymarket's liquidity, so you get access to the world's largest prediction market from Solana.

**Polymarket** (via Jupiter) — Deepest liquidity, widest coverage. Politics, crypto, sports, culture. CLOB orderbook — prices come from supply/demand.

**MetaDAO Futarchy** — Different game. Governance markets — "will this proposal make the token go up?" Two conditional markets (pass vs fail), the winning market determines the governance outcome. Outsmart has a `futarchy-amm` adapter for direct trading.

## Jupiter Prediction API

| Endpoint | Method | What |
|----------|--------|------|
| `/events` | GET | List events (filter by category, status) |
| `/events/search` | GET | Search by keyword |
| `/markets/{id}` | GET | Market details, pricing, orderbook |
| `/orderbook/{id}` | GET | Bid/ask depth |
| `/orders` | POST | Buy YES/NO contracts |
| `/positions` | GET | Your holdings + P&L |
| `/positions/{id}` | DELETE | Close position |
| `/positions/{id}/claim` | POST | Claim winning payout |

Fees scale with uncertainty — contracts near $0.50 cost more to trade. No fees on claiming payouts.

## The Only Rule: Edge

Only bet when your estimated probability significantly differs from the market price.

```
Edge = Your_Probability - Market_Price
```

| Edge | Action |
|------|--------|
| > 15% | Strong bet, 3-5% of portfolio |
| 10-15% | Standard bet, 1-2% |
| 5-10% | Marginal, small or skip |
| < 5% | No edge. The market is probably right. |

### Example

"Will SOL reach $300 by March?" — market says 25%. You estimate 45%. Edge = 20%.

Buy 100 YES at $0.25 = $26.32 (with fees). If right: $100 back = +$73.68. If wrong: -$26.32. Expected value: +$18.68.

## Research Process

1. **Understand the question exactly.** Read resolution criteria carefully. Edge cases matter.
2. **Gather info** — news, data, on-chain metrics, expert opinions, social signals. Use WebFetch.
3. **Estimate your probability honestly.** Common mistakes: overconfidence (moderate toward 50%), anchoring on market price, narrative bias, ignoring base rates.
4. **Calculate edge.** Account for fees.
5. **Size with fractional Kelly** (25-50%) to account for estimation error.

## Where AI Has Edge

| Category | Edge | Notes |
|----------|------|-------|
| Crypto events | High | ETF approvals, protocol launches, price targets — your core domain |
| Technology | High | AI milestones, product launches |
| Economics | Medium-High | Fed decisions, inflation — quantitative analysis |
| Politics | Medium | Deep liquidity here, smart money, edge is rarer |
| Culture | Medium | Depends on info availability |
| Sports | Low | Avoid unless you have specialized data |

## Portfolio Rules

- Max 10% total in open prediction positions
- Max 3-5% per individual bet
- Diversify across categories and platforms
- Track accuracy — record every bet, your estimate, and the outcome
- After each resolution: what did you miss? Which categories are you best at? Adjust.

## Survival Mode

- **Normal:** Active betting, up to 10%, full research
- **Low Compute:** 5% max, only >20% edge, focus on crypto markets
- **Critical:** No new bets. Let existing positions resolve. Don't chase losses.

## Related Skills

- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — Futarchy adapter for governance markets
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Capital allocation
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — CT monitoring (useful for crypto prediction markets)

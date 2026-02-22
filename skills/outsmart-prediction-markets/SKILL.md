---
name: outsmart-prediction-markets
description: Trade prediction markets on Solana via Jupiter. Use when user says "prediction", "prediction market", "bet", "forecast", "Polymarket", "Jupiter markets", "binary outcome", "will X happen", "probability", "odds", or mentions betting on real-world events.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# Prediction Markets Strategy

Trade on the outcome of real-world events. This is where AI agents have a **natural edge** — LLMs are demonstrably good at probabilistic reasoning, synthesizing information from multiple sources, and identifying cognitive biases in market prices.

## Why Prediction Markets?

- **Information edge:** You can synthesize vast amounts of data faster than human participants
- **Cognitive bias arbitrage:** Markets are priced by humans who suffer from recency bias, anchoring, and herd behavior. You don't.
- **Uncorrelated returns:** Prediction market outcomes are independent of crypto market movements
- **Binary payoff:** You either win or lose — simple risk management
- **Growing on Solana:** Jupiter's integration of prediction markets brings Polymarket-style betting to Solana

## The Edge Framework

### When to Bet

Only bet when you have **edge** — your estimated probability differs significantly from the market price.

```
Edge = Your_Probability - Market_Price
```

| Edge | Action |
|------|--------|
| > 15% | Strong bet. Size up (3-5% of portfolio). |
| 10-15% | Moderate bet. Standard size (1-2%). |
| 5-10% | Marginal edge. Small bet or skip. |
| < 5% | **No edge. Don't bet.** The market is probably right. |

### Example

Market says "Will SOL reach $300 by March?" at 25% (you can buy YES for $0.25).
Your analysis says the probability is 45%.
Edge = 45% - 25% = 20%. This is a strong bet.

If you buy $10 of YES shares at $0.25:
- **If correct:** You get $40 back (4x return)
- **If wrong:** You lose $10

Expected value: (0.45 × $40) + (0.55 × -$10) = $18 - $5.50 = **+$12.50 EV**

## Research Process

### Step 1: Understand the Question

Read the market question carefully. What exactly resolves YES? What are the edge cases? What's the resolution source?

### Step 2: Gather Information (Use WebFetch)

- **News:** Search for recent articles, announcements, and expert opinions
- **Data:** Look for relevant statistics, polls, historical precedents
- **Social signals:** What are experts on Twitter/X saying?
- **Counterarguments:** Actively seek out reasons you might be wrong

### Step 3: Estimate Your Probability

Be honest and calibrated. Common mistakes:
- **Overconfidence:** Your first instinct is usually too extreme. Moderate toward 50%.
- **Anchoring on market price:** Don't let the current price bias your independent estimate.
- **Narrative bias:** Just because something "feels" likely doesn't mean it is.
- **Base rate neglect:** Check historical base rates for similar events.

### Step 4: Calculate Edge and Size

```
Edge = Your_Probability - Market_Price
Position_Size = Edge × Portfolio_Allocation × Kelly_Fraction
```

Use fractional Kelly (25-50% Kelly) to account for estimation error.

### Step 5: Execute

Access prediction markets via Jupiter's interface or directly via the relevant Solana programs.

## Market Categories

| Category | AI Advantage | Notes |
|----------|-------------|-------|
| **Crypto events** (ETF approvals, protocol launches, price targets) | High — you can analyze on-chain data, dev activity, regulatory filings | Core competency for a DeFi agent |
| **Technology** (AI milestones, product launches) | High — you can synthesize technical analysis and industry trends | Natural domain knowledge |
| **Politics** (elections, policy decisions) | Medium — polling data + historical patterns | Strong base rate analysis |
| **Sports** | Low — limited edge without specialized models | Avoid unless you have specific data |
| **Current events** | Medium — depends on information availability | Good for well-covered events |

## Portfolio Management

### Rules
- **Max 10% of total portfolio** in open prediction market positions
- **Max 3-5% per individual bet** — no single bet should matter
- **Diversify across categories** — don't put all bets in one domain
- **Track your accuracy** — record every bet, your estimated probability, and the outcome. Review monthly.

### Learning Loop

After each resolved bet:
1. Was your probability estimate accurate?
2. What information did you miss?
3. Which category are you best at?
4. Adjust future allocation toward your strongest categories

**Procedural memory is critical here.** An autonomous agent should store:
- Bet history (market, estimate, outcome, profit/loss)
- Accuracy by category
- Common mistakes and lessons learned

## Survival Mode Rules

- **Normal:** Active betting, up to 10% of portfolio across open positions. Full research process.
- **Low Compute:** Reduce to 5% max. Only bet on highest-conviction plays (>20% edge).
- **Critical:** **No new bets.** Let existing positions resolve. Don't chase losses. Focus all capital on survival.

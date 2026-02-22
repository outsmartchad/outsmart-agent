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

# Prediction Markets Strategy

Trade on the outcome of real-world events. This is where AI agents have a **natural edge** — LLMs are demonstrably good at probabilistic reasoning, synthesizing information from multiple sources, and identifying cognitive biases in market prices.

## The Prediction Market Landscape

### Platforms Available

| Platform | Chain | Access from Solana | What You Trade |
|----------|-------|--------------------|----------------|
| **Jupiter Prediction** | Solana (native) | Direct — Jupiter API | Binary YES/NO on real-world events |
| **Polymarket** | Polygon (Ethereum L2) | Via Jupiter integration | World's largest prediction market — politics, crypto, sports, culture |
| **MetaDAO Futarchy** | Solana (native) | Direct — Futarchy adapter in outsmart | Governance decisions — "will this proposal make the token go up?" |

### Jupiter Prediction Market (Primary)

Jupiter has built a native Solana prediction market AND integrated Polymarket's liquidity. This means you can access Polymarket-style markets directly from Solana through Jupiter's API.

**How it works:**
1. **Events** are created around real-world occurrences (e.g., "Will SOL reach $300 by March?")
2. **Markets** within events are binary YES/NO contracts priced $0.00–$1.00
3. **Price = probability** — a YES contract at $0.65 means 65% implied probability
4. **Winners get $1 per contract** — if you buy YES at $0.40 and it resolves YES, you profit $0.60 per contract
5. **Settlement in JupUSD** — payouts are in Jupiter's stablecoin

**Categories:** Crypto, Sports, Politics, E-sports, Culture, Economics, Tech

**Jupiter Prediction API:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/events` | GET | List events with filters (category, status) |
| `/events/search` | GET | Search events by keyword |
| `/markets/{marketId}` | GET | Get market details, pricing, orderbook depth |
| `/orderbook/{marketId}` | GET | Bid/ask depth for a market |
| `/orders` | POST | Create buy order for YES/NO contracts |
| `/positions` | GET | List your holdings with P&L |
| `/positions/{id}` | DELETE | Close entire position |
| `/positions/{id}/claim` | POST | Claim payout on winning position |
| `/orders` | DELETE | Cancel pending order |
| `/history` | GET | Transaction history with event types |

**Fee structure** — fees vary by contract price and trade size. More uncertain outcomes (price near $0.50) = higher fees:

| Price per Contract | Fee (1 Contract) | Fee (100 Contracts) |
|:-:|:-:|:-:|
| $0.05 | $0.01 | $0.34 |
| $0.10 | $0.01 | $0.63 |
| $0.25 | $0.02 | $1.32 |
| $0.40 | $0.02 | $1.68 |
| $0.50 | ~$0.02 | ~$1.75 |

No fees on claiming payouts. Fees only on executed trades.

### Polymarket (Via Jupiter)

Polymarket is the world's largest prediction market (~$1B+ cumulative volume). Originally on Polygon, Jupiter has integrated it so Solana users can trade Polymarket events.

**Key Polymarket concepts:**
- **CLOB orderbook** — prices emerge from supply/demand, not set by the platform
- **Hybrid-decentralized** — offchain matching for speed, onchain settlement for security
- **Multi-market events** — one event can contain multiple markets (e.g., "Who wins the election?" has separate YES/NO markets per candidate)
- **Market orders** execute immediately at best available price; **limit orders** sit in the book
- **Price = midpoint** of bid/ask spread (if spread > $0.10, shows last traded price instead)

**Polymarket's strengths:**
- Deepest liquidity — tight spreads on popular markets
- Widest event coverage — especially politics, macro, and culture
- Highly researched — lots of smart money participating, making mispricing rarer but more valuable when found

### MetaDAO Futarchy (Decision Markets)

Futarchy is a different beast — not prediction markets on external events, but **governance markets** where you trade on whether a proposal will make a token's value increase or decrease.

**How it works:**
1. A DAO creates a proposal (e.g., "Should Jito enable the fee switch?")
2. Two markets are created: "token value IF proposal passes" vs "token value IF proposal fails"
3. Traders bet on which outcome is better for the token
4. The proposal is accepted/rejected based on which market prices higher

**Notable Futarchy decisions:**
- Jito's fee switch
- Flash's revenue sharing to stakers
- All of Sanctum's governance

**Why this matters for an agent:**
- Our `outsmart-cli` already has a **Futarchy adapter** (futarchy-amm, futarchy-launchpad)
- You can trade governance proposals directly via the outsmart MCP tools
- Edge comes from understanding the on-chain impact of proposals better than the market

## Why Prediction Markets?

- **Information edge:** You can synthesize vast amounts of data faster than human participants
- **Cognitive bias arbitrage:** Markets are priced by humans who suffer from recency bias, anchoring, and herd behavior. You don't.
- **Uncorrelated returns:** Prediction market outcomes are independent of crypto market movements
- **Binary payoff:** You either win or lose — simple risk management
- **Growing liquidity:** Jupiter + Polymarket integration brings deep liquidity to Solana

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

If you buy 100 YES contracts at $0.25:
- **Cost:** $25.00 + ~$1.32 fees = $26.32
- **If correct:** You get $100 back → **+$73.68 profit**
- **If wrong:** You lose $26.32

Expected value: (0.45 x $100) - $26.32 = **+$18.68 EV**

## Research Process

### Step 1: Understand the Question

Read the market question carefully. What exactly resolves YES? What are the edge cases? What's the resolution source? Check the rules document — resolution criteria are everything.

### Step 2: Gather Information (Use WebFetch)

- **News:** Search for recent articles, announcements, and expert opinions
- **Data:** Look for relevant statistics, polls, historical precedents
- **On-chain data:** For crypto markets, check on-chain metrics (TVL, volume, developer activity)
- **Social signals:** What are experts on Twitter/X saying?
- **Counterarguments:** Actively seek out reasons you might be wrong
- **Polymarket/Jupiter orderbook:** Check the depth — thin books mean your trade moves the price

### Step 3: Estimate Your Probability

Be honest and calibrated. Common mistakes:
- **Overconfidence:** Your first instinct is usually too extreme. Moderate toward 50%.
- **Anchoring on market price:** Don't let the current price bias your independent estimate.
- **Narrative bias:** Just because something "feels" likely doesn't mean it is.
- **Base rate neglect:** Check historical base rates for similar events.
- **Ignoring the vig:** Account for fees when calculating if edge is real.

### Step 4: Calculate Edge and Size

```
Edge = Your_Probability - Market_Price
Position_Size = Edge x Portfolio_Allocation x Kelly_Fraction
```

Use fractional Kelly (25-50% Kelly) to account for estimation error.

### Step 5: Execute

**For Jupiter Prediction / Polymarket:**
- Access via Jupiter Prediction API endpoints
- Buy YES or NO contracts at your desired price
- Monitor via `/positions` endpoint

**For Futarchy governance markets:**
- Use `solana_buy` with `dex="futarchy-amm"` and the relevant market pool
- Trade the pass/fail conditional tokens

## Market Categories & AI Edge

| Category | AI Advantage | Best Sources | Notes |
|----------|-------------|-------------|-------|
| **Crypto events** (ETF approvals, protocol launches, price targets) | High | On-chain data, dev repos, regulatory filings | Core competency for a DeFi agent |
| **Technology** (AI milestones, product launches) | High | Technical papers, company announcements | Natural domain knowledge |
| **Politics** (elections, policy decisions) | Medium | Polling aggregates, historical base rates, prediction market consensus | Polymarket is deepest here — lots of smart money, edge is rarer |
| **Economics** (Fed decisions, inflation data) | Medium-High | Economic data, Fed minutes, yield curves | Strong quantitative analysis opportunity |
| **Sports** | Low | Limited edge without specialized models | Avoid unless you have specific data |
| **Culture / Current events** | Medium | News feeds, social media trends | Depends on information availability |

## Portfolio Management

### Rules
- **Max 10% of total portfolio** in open prediction market positions
- **Max 3-5% per individual bet** — no single bet should matter
- **Diversify across categories** — don't put all bets in one domain
- **Diversify across platforms** — spread between Jupiter native and Polymarket via Jupiter
- **Track your accuracy** — record every bet, your estimated probability, and the outcome. Review monthly.
- **Check liquidity before sizing** — thin orderbooks mean slippage eats your edge

### Learning Loop

After each resolved bet:
1. Was your probability estimate accurate?
2. What information did you miss?
3. Which category are you best at?
4. Adjust future allocation toward your strongest categories

**Procedural memory is critical here.** An autonomous agent should store:
- Bet history (market, platform, estimate, outcome, profit/loss)
- Accuracy by category and platform
- Common mistakes and lessons learned

## Survival Mode Rules

- **Normal:** Active betting, up to 10% of portfolio across open positions. Full research process.
- **Low Compute:** Reduce to 5% max. Only bet on highest-conviction plays (>20% edge). Focus on crypto markets where you have natural advantage.
- **Critical:** **No new bets.** Let existing positions resolve. Don't chase losses. Focus all capital on survival.

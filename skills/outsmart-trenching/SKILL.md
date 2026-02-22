---
name: outsmart-trenching
description: Trade memecoins on Solana like a degen. Use when user says "memecoin", "trench", "trenching", "degen", "ape", "GMGN", "Axiom", "pump", "moon", "100x", "gem", "alpha", "CT", "crypto twitter", "smart money", "whale", "fresh wallet", "dev wallet", or mentions memecoin trading on Solana.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# Memecoin Trenching Strategy

Welcome to the trenches. This is where degens live. You're trading memecoins — tokens with no fundamentals, no revenue, no product. Just vibes, narratives, and social momentum. Most go to zero. Some go to $1B.

**This is the highest-risk, highest-reward strategy in the toolkit.** If you're an autonomous agent, never allocate more than 10% of your portfolio here.

## The Trenching Mindset

1. **You are trading attention, not value.** Memecoins move on hype, CT engagement, influencer calls, and narrative momentum.
2. **Speed is important but conviction is more important.** A 10x gem bought with research at 5 minutes old beats a rug bought blind at 10 seconds.
3. **Every entry is a potential total loss.** Size accordingly.
4. **Take profits.** Unrealized gains are not real. Sell into strength.

## Research Before Entry

### Step 1: Token Intel

```
solana_token_info(token) → DexScreener data
```

**What you're looking for:**

| Metric | Good Sign | Bad Sign |
|--------|----------|----------|
| `liquidityInSOL` | > 50 SOL ($7k+) | < 10 SOL — will get rekt on exit |
| `buyers5m` / `buyers1h` | Growing, diverse buyers | Flat or declining after initial spike |
| `volume5m` vs `buyers5m` | Proportional (organic) | Huge volume, few buyers (wash/whale) |
| `pairAge` | 10m-6h (sweet spot) | < 2m (too early, risky) or > 24h (momentum dead) |
| `marketCap` | $50k-$5M (room to run) | > $50M (you're late) |

### Step 2: Social Signals (Use WebFetch)

Check if the token has narrative momentum:
- **Twitter/X:** Is there organic engagement? Multiple accounts talking about it? Or just one shill account?
- **Telegram:** Active community or ghost town?
- **CT influencers:** Any notable calls? (Be skeptical — paid shills exist)

### Step 3: On-Chain Intelligence

Use GMGN (gmgn.ai) or Axiom (axiom.trade) data to check:
- **Top holders:** Is one wallet holding >20% of supply? Red flag.
- **Dev wallet:** Has the dev sold? If dev holds 0%, the token is "dev-free" (bullish for memecoins)
- **Smart money:** Are known profitable wallets buying? Check GMGN's smart money tracker.
- **Fresh wallets:** Lots of fresh wallets buying = coordinated bot activity. Avoid.
- **Bundled buys:** Multiple buys in the same block from related wallets = insider launch. Be cautious.

## Execution

### Buy
```json
{
  "dex": "jupiter-ultra",
  "token": "TOKEN_MINT",
  "amount": 0.05
}
```

Or for a specific PumpFun AMM pool:
```json
{
  "dex": "pumpfun-amm",
  "pool": "POOL_ADDRESS",
  "amount": 0.05
}
```

### Position Sizing

| Your Conviction | Position Size | Notes |
|----------------|---------------|-------|
| "This could be THE narrative play" | 3-5% of portfolio | Max size. Strong thesis required. |
| "Looks interesting, good signs" | 1-2% | Standard trench size |
| "FOMO, everyone's buying" | **0%** | If your reason is FOMO, don't buy |

### Take Profits — The Trench Exit Ladder

| Milestone | Action |
|-----------|--------|
| **2x** | Sell 25% — recover half your cost basis |
| **3x** | Sell another 25% — you're now playing with house money |
| **5x** | Sell another 25% — lock in serious profit |
| **10x+** | Sell the last 25% or let it ride with a tight mental stop |

```
solana_sell(dex, pool_or_token, percentage=25)  → partial take profit
```

**Never ride a memecoin back to zero.** If momentum breaks (volume crashes, key holders selling, narrative shifts), exit immediately.

## Common Memecoin Narratives

Memecoins run on narratives. Being early to the right narrative is everything:

| Narrative Type | Example | How to Spot |
|---------------|---------|-------------|
| **Animal coins** | BONK, WIF, POPCAT | New animal meme goes viral on Twitter |
| **AI/tech memes** | GOAT, TURBO | AI-generated content or AI agent tokens |
| **Political** | TRUMP, BODEN | Election cycles, political events |
| **CT insider** | Named after a CT personality or meme | CT feeds, quote tweets |
| **Event-driven** | Token launched around a conference, announcement | Crypto calendar, news |

## Red Flags — Instant No-Buy

- Token contract is not verified / has mint authority enabled
- Single wallet holds >30% of supply
- Dev is actively selling into buys
- Honeypot: you can buy but can't sell (test with tiny amount first)
- Telegram group is all bots posting "MOON" and "LFG"
- Token name is a direct copy of an existing successful token

## Survival Mode Rules

- **Normal:** Active trenching, max 10% of portfolio allocated, full research on each trade
- **Low Compute:** View-only mode — research tokens but don't buy. Preserve capital.
- **Critical:** **ZERO trenching. This is gambling. You cannot afford to gamble when you're dying.** Liquidate any memecoin holdings immediately.

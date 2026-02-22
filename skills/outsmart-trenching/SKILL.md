---
name: outsmart-trenching
description: Trade memecoins on Solana like a degen. Use when user says "memecoin", "trench", "trenching", "degen", "ape", "GMGN", "Axiom", "pump", "moon", "100x", "gem", "alpha", "CT", "crypto twitter", "smart money", "whale", "fresh wallet", "dev wallet", "rug", "honeypot", "insider", "sniper", "copy trade", or mentions memecoin trading on Solana.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# Memecoin Trenching Strategy

Welcome to the trenches. This is where degens live. You're trading memecoins — tokens with no fundamentals, no revenue, no product. Just vibes, narratives, and social momentum. Most go to zero. Some go to $1B.

**This is the highest-risk, highest-reward strategy in the toolkit.** If you're an autonomous agent, never allocate more than 10% of your portfolio here.

## The Trenching Mindset

1. **You are trading attention, not value.** Memecoins move on hype, CT engagement, influencer calls, and narrative momentum.
2. **Speed is important but conviction is more important.** A 10x gem bought with research at 5 minutes old beats a rug bought blind at 10 seconds.
3. **Every entry is a potential total loss.** Size accordingly.
4. **Take profits.** Unrealized gains are not real. Sell into strength.
5. **The best trenchers are researchers first, traders second.** They use multiple tools to cross-reference signals before aping.

## The Trencher's Toolkit

Good trenchers don't trade blind. They use an ecosystem of tools for signal detection, security checking, and smart money tracking:

### Signal Detection Tools

| Tool | What It Does | Key Feature |
|------|-------------|-------------|
| **GMGN.ai** | Smart money tracker + security checker | Insider/sniper detection, first 70 buyers analysis, rug probability scoring, dev rug history |
| **Cielo** | Wallet tracker + alpha aggregator | Mindshare metric (proprietary activity score), wallet discovery for finding profitable wallets, custom alerts |
| **Axiom** | Trading terminal + social monitor | Twitter monitor (auto-detects CAs in tweets), wallet tracking, buy/sell on migration |
| **DexScreener** | Chart + token discovery | Token profiles, community takeovers (CTO), boosted tokens, all data direct from blockchain |
| **Bubblemaps** | Supply distribution visualizer | Cluster detection — shows linked wallets, identifies hidden supply concentration |

### Security Check Tools

| Tool | What It Checks |
|------|---------------|
| **Jupiter Shield API** | Freeze authority, mint authority, low organic activity, new listing warnings |
| **Jupiter Organic Score** | Filters bot/wash activity, measures real user participation (holder count, volume, liquidity from real wallets) |
| **GMGN CA Security** | MintDisable, Top10 hold, Blacklist, LP burn %, rug probability, dev rug history |
| **RugCheck.xyz** | Contract analysis, mint/freeze authority, LP lock status |

## Research Before Entry — The Pro Trencher's Checklist

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

### Step 2: Security Checks (Critical — Don't Skip)

**GMGN security checklist (check all of these):**

| Check | Safe | Dangerous |
|-------|------|-----------|
| **MintDisable** | Yes — creator can't mint more | No — can inflate supply and dump |
| **Top10 hold** | <30% of supply | >30% — concentrated, dump risk |
| **Blacklist** | No — can't freeze wallets | Yes — dev can freeze your tokens, you can't sell |
| **LP Burned** | 100% burned (can't pull liquidity) | LP not burned — 60% chance of rug pull |
| **Rug probability** | Low (based on holder analysis) | High — many holders also hold previous rugs |
| **Dev rug history** | Clean — no prior rugs | Has launched rug pulls before — instant skip |

**Jupiter Shield API** — additional automated check:
```
GET /ultra/v1/shield?mints={token_mint}
```
Returns warnings: `HAS_FREEZE_AUTHORITY`, `HAS_MINT_AUTHORITY`, `LOW_ORGANIC_ACTIVITY`, `NOT_VERIFIED`, `NEW_LISTING`

### Step 3: Insider & Sniper Analysis

This is what separates good trenchers from exit liquidity:

**First 70 buyers analysis (GMGN):**
- Check who bought first — snipers in the first blocks who hold >5% of supply = 90% chance of dump
- "Scammer wallet" labels — wallets that frequently buy rug pulls (likely dev alt wallets)
- Insider trading ratio — wallets that hold tokens without having bought them = dev distributed supply to alt wallets to dump later
- What % of first 70 still holding vs sold all? If most sold all → they knew something

**Activity thresholds (from GMGN research):**
- **60+ trades in first minute** = real activity, genuine interest
- **600+ trades in first 5 minutes** = strong organic demand
- Below these = likely wash trading or very low interest

**Bundled buys:** Multiple buys in the same block from related wallets = coordinated insider launch. The dev pre-loaded wallets to make it look organic. Be very cautious.

### Step 4: Smart Money Signals

**Copy-trading smart money** is a core trenching strategy:

1. **Build a watchlist** of profitable wallets using GMGN's smart money discovery or Cielo's wallet discovery
2. **Track their buys in real-time** — GMGN shows notifications when tracked wallets buy new tokens
3. **When multiple smart wallets converge on the same new token** — that's a strong signal
4. **But verify independently** — even smart money buys rugs. Always run your own security checks.

**Cielo Mindshare** — proprietary metric showing how much activity a token is getting among all Cielo users. Higher Mindshare % = hotter token. Useful as a social momentum indicator.

### Step 5: Social Signals (Use WebFetch)

Check if the token has narrative momentum:
- **Twitter/X:** Is there organic engagement? Multiple accounts talking about it? Or just one shill account?
- **Telegram:** Active community or ghost town?
- **CT influencers:** Any notable calls? (Be skeptical — paid shills exist)
- **Community Takeover (CTO):** DexScreener shows if a token has been "taken over" by its community — this can be bullish (community-driven) but also a warning (original dev abandoned it)

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
| "This could be THE narrative play" + all checks pass | 3-5% of portfolio | Max size. Strong thesis + clean security required. |
| "Looks interesting, good signs" | 1-2% | Standard trench size |
| "Smart money is buying but I haven't fully verified" | 0.5-1% | Tiny recon position |
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

### The Trench-to-LP Pipeline

After trenching into a memecoin, consider the LP play (see `outsmart-lp-farming` skill):

1. **Token age < 5 min, big volume, many manual swaps?** → Create a DAMM v2 pool (~0.02 SOL), set 99% starting fee, capture all early fees
2. **Token age > 30 min, established volume, many unique traders?** → Open a DLMM position (~0.2 SOL) with Curve strategy for ongoing fee capture
3. **Your memecoin bag + LP fees** = dual income stream from a single trade

## Common Memecoin Narratives

Memecoins run on narratives. Being early to the right narrative is everything:

| Narrative Type | Example | How to Spot |
|---------------|---------|-------------|
| **Animal coins** | BONK, WIF, POPCAT | New animal meme goes viral on Twitter |
| **AI/tech memes** | GOAT, TURBO | AI-generated content or AI agent tokens |
| **Political** | TRUMP, BODEN | Election cycles, political events |
| **CT insider** | Named after a CT personality or meme | CT feeds, quote tweets |
| **Event-driven** | Token launched around a conference, announcement | Crypto calendar, news |
| **CTO (Community Takeover)** | Dev abandoned, community revives | DexScreener CTO label, Telegram community activity |

## Red Flags — Instant No-Buy

| Red Flag | Why | Detection |
|----------|-----|-----------|
| Mint authority enabled | Dev can inflate supply | Jupiter Shield, GMGN MintDisable=No |
| Freeze authority enabled | Dev can freeze your tokens, you can't sell | Jupiter Shield `HAS_FREEZE_AUTHORITY` |
| Single wallet holds >30% | One dump kills the chart | GMGN Top10 hold, Bubblemaps |
| LP not burned or locked | Dev can pull all liquidity (rug) | GMGN LP burn %, RugCheck |
| Dev actively selling into buys | Slow rug in progress | GMGN first 70 buyers "Sell All" pattern |
| Dev has rug history | Serial scammer | GMGN "Rug History" shows previous rugs |
| Snipers holding >5% from block 0 | Coordinated dump incoming | GMGN sniper analysis |
| Honeypot (can buy, can't sell) | You're trapped | Test with tiny amount, GMGN Honeypot check |
| Low organic score | Bot/wash activity, not real users | Jupiter Organic Score |
| Fresh wallets buying in clusters | Coordinated bot activity, fake demand | GMGN first 70 analysis, bundled buy detection |
| Token is a direct copy of existing success | Lazy scam riding another token's name | Check DexScreener for similar names |

## Survival Mode Rules

- **Normal:** Active trenching, max 10% of portfolio allocated, full research checklist on each trade
- **Low Compute:** View-only mode — research tokens but don't buy. Track smart money for future reference. Preserve capital.
- **Critical:** **ZERO trenching. This is gambling. You cannot afford to gamble when you're dying.** Liquidate any memecoin holdings immediately.

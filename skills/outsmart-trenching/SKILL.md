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

**The order matters.** Good trenchers find the narrative first, then verify safety before buying. The agent should be constantly scanning for what's hot — security is the gate before you buy, not the starting point.

### Step 1: Find the Heat (Always Be Scanning)

**This is the most important step.** The agent should be continuously monitoring for what's going viral RIGHT NOW:

**Twitter/X monitoring (primary signal source):**
- Watch CT for what's getting unusual engagement — a topic blowing up, a meme going viral, a product launch
- Track KOL accounts — when multiple influencers tweet about the same thing within an hour, a meta is forming
- Look for CAs (contract addresses) being shared in viral tweets
- Axiom's Twitter monitor auto-detects CAs in tweets — fastest way to catch launches tied to viral moments

**Smart money convergence:**
- Build a watchlist of profitable wallets using GMGN's smart money discovery or Cielo's wallet discovery
- Track their buys in real-time — GMGN shows notifications when tracked wallets buy new tokens
- **When multiple smart wallets converge on the same new token** — that's a strong signal
- Cielo Mindshare — sudden spike in activity around a token/theme = meta is heating up

**News & viral content:**
- Use WebFetch to check trending topics, viral news, product launches
- Anything going viral in mainstream culture can spawn a meta (a game goes viral → game-themed tokens, a celeb does something → celeb tokens)
- The faster you connect "viral thing" → "someone launched a token for it", the earlier you are

**On-chain scanning:**
- Watch GMGN "Sniper New" feed for clusters of new tokens with the same theme
- DexScreener trending/boosted tokens
- When you see 5+ tokens with the same narrative launching in an hour, the meta is real

### Step 2: Quick Token Check

Once you've spotted something hot, quickly size up the token:

```
solana_token_info(token) → DexScreener data
```

| Metric | Good Sign | Bad Sign |
|--------|----------|----------|
| `liquidityInSOL` | > 50 SOL ($7k+) | < 10 SOL — will get rekt on exit |
| `buyers5m` / `buyers1h` | Growing, diverse buyers | Flat or declining after initial spike |
| `volume5m` vs `buyers5m` | Proportional (organic) | Huge volume, few buyers (wash/whale) |
| `pairAge` | 10m-6h (sweet spot) | < 2m (too early, risky) or > 24h (momentum dead) |
| `marketCap` | $50k-$5M (room to run) | > $50M (you're late) |

### Step 3: Security Gate (Must Pass Before Buying)

The narrative is hot, the token looks good — now make sure it's not a rug before you ape:

**GMGN security checklist:**

| Check | Safe | Dangerous |
|-------|------|-----------|
| **MintDisable** | Yes — creator can't mint more | No — can inflate supply and dump |
| **Top10 hold** | <30% of supply | >30% — concentrated, dump risk |
| **Blacklist** | No — can't freeze wallets | Yes — dev can freeze your tokens, you can't sell |
| **LP Burned** | 100% burned (can't pull liquidity) | LP not burned — 60% chance of rug pull |
| **Rug probability** | Low (based on holder analysis) | High — many holders also hold previous rugs |
| **Dev rug history** | Clean — no prior rugs | Has launched rug pulls before — instant skip |

**Jupiter Shield API** — fast automated check:
```
GET /ultra/v1/shield?mints={token_mint}
```
Returns warnings: `HAS_FREEZE_AUTHORITY`, `HAS_MINT_AUTHORITY`, `LOW_ORGANIC_ACTIVITY`, `NOT_VERIFIED`, `NEW_LISTING`

**Insider & sniper analysis (GMGN first 70 buyers):**
- Snipers in first blocks holding >5% of supply = 90% chance of dump
- "Scammer wallet" labels = wallets that frequently buy rug pulls (likely dev alts)
- Insider trading ratio = wallets holding tokens without buying them (dev distributed to alts)
- Bundled buys in same block = coordinated insider launch

**Activity thresholds:**
- **60+ trades in first minute** = real activity
- **600+ trades in first 5 minutes** = strong organic demand
- Below these = likely wash trading

**If any critical red flag is present → SKIP. Move to the next token in the meta.** There are always multiple tokens per meta — find a clean one.

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

## Narratives & Metas — How the Trenches Actually Work

Memecoins don't run on fundamentals. They run on **metas** — narrative waves where one viral thing spawns dozens of derivative tokens. Being early to the right meta is everything. Being late to a dying meta is how you become exit liquidity.

### How a Meta Forms

1. **A catalyst goes viral** — a tweet, a product, a meme, a cultural moment
2. **The "alpha" token launches** — the first token associated with the catalyst pumps hard
3. **Copycats flood in** — dozens of tokens launch riding the same theme within hours
4. **Meta peaks** — CT is saturated, everyone is talking about it, volume is insane
5. **Meta dies** — attention shifts to the next thing. Latecomers get dumped on.

**The window is small.** Most metas last 1-3 days. The money is made in the first few hours. By the time it's on everyone's timeline, you're late.

### Recent Meta Examples

| Meta | Catalyst | What Happened |
|------|----------|---------------|
| **Claw meta** | OpenClaw went viral → "claw machine" narrative explodes | Dozens of claw-themed tokens launched, first movers 10-50x'd |
| **Moltbook** | Viral product/meme → spawned its own meta wave | Early entries printed, copycats followed within hours |
| **Aliens meta** | Alien-themed content goes viral on CT | Alien tokens flood PumpFun, meta runs for 1-2 days |
| **AI agents** | GOAT + ai16z narrative → every AI agent gets a token | Multi-week meta, biggest of 2024, spawned entire ecosystem |
| **Chinese meta** | Chinese-language memes on CT → Western traders pile in | Short but explosive, tokens with Chinese characters pumped |
| **Animal meta** | WIF → POPCAT → MOODENG → animal season | Rolling meta, each new viral animal gets its own token wave |
| **Celeb meta** | Celebrity token launches (TRUMP etc.) | Massive volume spikes, extremely fast cycle (hours not days) |

### How to Catch a Meta Early

1. **Monitor CT obsessively** — the meta starts on Twitter/X. Watch for a topic getting unusual engagement, multiple accounts posting about the same new thing
2. **Watch the "Sniper New" feed on GMGN** — when multiple new tokens share a theme (claw, alien, etc.), a meta is forming
3. **Track smart money convergence** — when 3+ tracked profitable wallets buy tokens in the same narrative within an hour, the meta has legs
4. **Check Cielo Mindshare** — a sudden spike in Mindshare for a theme/token = meta is heating up
5. **Don't wait for confirmation** — by the time CT influencers are posting about it, you're in phase 4 (peak). The best entries are in phases 1-2.

### Meta Lifecycle & Position Strategy

| Phase | Signs | Action |
|-------|-------|--------|
| **1. Catalyst** | Viral tweet/event, 0-2 tokens launched | Ape the first clean token. Highest risk, highest reward. |
| **2. Early meta** | 5-10 tokens, smart money entering, organic CT buzz | Buy the 2-3 strongest (best liquidity, best narrative fit). Standard size. |
| **3. Meta confirmed** | 20+ tokens, CT influencers posting, trending on GMGN/DexScreener | Sell into strength on your early positions. Maybe buy the "last good one" with tiny size. |
| **4. Peak/saturation** | Everyone talking about it, new tokens every minute, copycats of copycats | **SELL. Do not buy.** You are the exit liquidity at this point. |
| **5. Meta death** | Volume crashes, CT moves on, new meta forming | Exit any remaining positions. Rotate attention to the next catalyst. |

### What Makes a Meta Token "The One" vs a Copycat

Not all tokens in a meta are equal. The winners tend to have:
- **First mover** in the narrative (or the best name/ticker)
- **Clean contract** — all security checks pass, no insider concentration
- **Organic buyer diversity** — lots of unique wallets, not just 10 whales
- **Sticky community** — Telegram/Discord forms fast and stays active
- **The "official" feel** — best branding, closest association to the original catalyst

The copycats that just slap the meta keyword in their name with no effort die fast.

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

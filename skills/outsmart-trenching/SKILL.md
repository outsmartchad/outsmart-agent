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

# Trenching

You're trading attention. Memecoins have no fundamentals, no revenue, no product — just vibes, narratives, and social momentum. Most go to zero. Some go to $1B. Cap your allocation at 10% of portfolio.

## Finding What's Hot

This is the whole game. The buy/sell is the easy part. Knowing **what** to buy and **when** is everything.

### Always Be Scanning

**Twitter/X** — Ground zero for every meta. Watch for unusual engagement spikes. When 5+ accounts start posting about the same thing in an hour, something's forming. Axiom's Twitter monitor auto-detects contract addresses in tweets — fastest way to connect viral moment to tradeable token.

**Smart money** — Build a watchlist of profitable wallets on GMGN or Cielo. Track their buys in real-time. When 3+ of them converge on the same new token, that's a real signal. Cielo's Mindshare metric spikes when a narrative is heating up.

**News and viral content** — Anything that blows up in mainstream culture can spawn tokens within minutes. A game goes viral, a celeb does something, a product launches. The faster you connect "viral thing" to "someone launched a token for it", the earlier you are.

**On-chain** — GMGN "Sniper New" feed, DexScreener trending/boosted. When 5+ tokens with the same theme launch in an hour, the meta is real.

### How Metas Work

A meta is a narrative wave. One thing goes viral, dozens of derivative tokens spawn, money flows in, then it dies. The lifecycle:

1. **Catalyst** — Something goes viral. 0-2 tokens exist. This is the best entry but hardest to spot.
2. **Early meta** — 5-10 tokens, smart money entering, organic CT buzz. Buy the 2-3 strongest.
3. **Confirmed** — 20+ tokens, influencers posting, trending everywhere. Sell into strength. Maybe buy the last good one with tiny size.
4. **Peak** — Everyone's talking about it. New tokens every minute. **Do not buy. You are exit liquidity.**
5. **Dead** — Volume crashes, CT moves on. Exit remaining positions. Find the next thing.

**The window is phases 1-2.** By phase 3 you're probably late. Most metas last 1-3 days. The money is made in the first few hours.

### Recent Metas

OpenClaw/claw meta, Moltbook, aliens, AI agents (GOAT, ai16z — this one ran for weeks), Chinese meta, animal meta (WIF → POPCAT → MOODENG), celeb tokens (TRUMP). Each followed the same lifecycle. The winners were the first tokens with the right name and clean contracts.

### What Makes a Meta Token "The One"

- First mover with the best name/ticker
- Clean contract — all security checks pass
- Organic buyer diversity — lots of unique wallets
- Community forms fast (Telegram/Discord)
- Feels "official" — best branding, closest association to the catalyst

Copycats with zero effort die fast.

## Before You Buy — Security Gate

The narrative is hot, the token looks good. Now make sure it's not a rug.

### Quick Check

```
solana_token_info(token) → DexScreener data
```

| Metric | Good | Bad |
|--------|------|-----|
| Liquidity | > 50 SOL | < 10 SOL |
| Buyers (5m/1h) | Growing, diverse | Flat or declining |
| Volume vs buyers | Proportional | Huge volume, few buyers |
| Age | 10min - 6h | < 2min or > 24h with no momentum |
| Market cap | $50k - $5M | > $50M (you're late) |

### Security Checklist

**GMGN:**
- MintDisable = Yes (creator can't inflate supply)
- Top10 hold < 30% (not concentrated)
- Blacklist = No (can't freeze your tokens)
- LP burned 100% (can't pull liquidity)
- Dev rug history = clean
- Snipers in first blocks holding >5% = coordinated dump incoming

**Jupiter Shield API:**
```
GET /ultra/v1/shield?mints={mint}
```
Flags: `HAS_FREEZE_AUTHORITY`, `HAS_MINT_AUTHORITY`, `LOW_ORGANIC_ACTIVITY`

**Activity:**
- 60+ trades in first minute = real
- 600+ trades in 5 minutes = strong organic
- Below these thresholds = likely wash

**Any critical red flag = skip.** There are always multiple tokens per meta. Find a clean one.

## Execution

```json
{ "dex": "jupiter-ultra", "token": "MINT", "amount": 0.05 }
```

### Sizing

| Conviction | Size |
|-----------|------|
| Strong thesis + clean security | 3-5% |
| Looks good, decent signals | 1-2% |
| Smart money buying, not fully verified | 0.5-1% |
| FOMO | 0% |

### Taking Profits

| Hit | Action |
|-----|--------|
| 2x | Sell 25% |
| 3x | Sell another 25% — now playing with house money |
| 5x | Sell another 25% |
| 10x+ | Sell or ride with tight mental stop |

**Never ride a memecoin back to zero.** If volume crashes, key holders sell, or the narrative shifts — get out.

### After — The LP Play

If the token has legs:
1. **< 5 min, big volume** → create DAMM v2 pool via `solana_create_pool` with 99% fee, capture early volume
2. **> 30 min, established** → open DLMM position for ongoing fees
3. Memecoin bag + LP fees = dual income from one trade

## Red Flags — Instant Skip

| Flag | Detection |
|------|-----------|
| Mint authority enabled | Jupiter Shield, GMGN |
| Freeze authority | Jupiter Shield |
| Single wallet >30% supply | GMGN, Bubblemaps |
| LP not burned/locked | GMGN, RugCheck |
| Dev selling into buys | GMGN first 70 buyers |
| Dev has rug history | GMGN |
| Snipers >5% from block 0 | GMGN |
| Honeypot | Test with 0.001 SOL |
| Low organic score | Jupiter Organic Score |
| Fresh wallets buying in clusters | GMGN bundled buy detection |

## The Toolkit

**What the agent can do directly (MCP tools):**
- `solana_token_info` — DexScreener data (price, volume, buyers, liquidity, age)
- `solana_buy` / `solana_sell` — execute trades
- `solana_find_pool` — discover pool addresses
- Jupiter Shield API — call via WebFetch: `GET https://api.jup.ag/ultra/v1/shield?mints={mint}`

**External tools (agent can browse via WebFetch but can't fully automate):**

| Tool | Use | Agent Access |
|------|-----|-------------|
| **GMGN** | Smart money, security, insider detection, first 70 buyers | Browse via WebFetch (gmgn.ai) |
| **Cielo** | Wallet discovery, Mindshare, alerts | Requires account |
| **Axiom** | Twitter monitor (auto-detects CAs) | Requires account |
| **DexScreener** | Charts, token profiles, boosted tokens | Browse via WebFetch |
| **Bubblemaps** | Supply distribution, cluster detection | Browse via WebFetch |
| **RugCheck** | Contract analysis, LP lock status | Browse via WebFetch (rugcheck.xyz) |

## Survival Mode

- **Normal:** Active trenching, 10% max portfolio, full research per trade
- **Low Compute:** Research only — track smart money, don't buy
- **Critical:** Zero trenching. This is gambling. Liquidate any memecoin holdings.

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — Trench → LP pipeline
- **[outsmart-lp-sniping](../outsmart-lp-sniping/SKILL.md)** — Early entry on graduations
- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — Tool reference
- **[outsmart-survival](../outsmart-survival/SKILL.md)** — Risk tiers

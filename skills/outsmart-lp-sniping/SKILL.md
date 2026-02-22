---
name: outsmart-lp-sniping
description: Snipe new LP pools and token launches on Solana. Use when user says "snipe", "new token", "launch", "PumpFun", "bonding curve", "graduation", "migration", "new pool", "early entry", "snipe LP", or mentions buying tokens at launch or sniping new liquidity pools.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# Token Sniping Strategy

Buy tokens early on new launches. High risk, high reward. Most tokens go to zero. The ones that don't can 10-100x.

## The Hard Truth

- **90%+ of new tokens are rugs, scams, or die within hours**
- **Position sizing is everything** — never risk more than 2-5% of your portfolio on a single snipe
- **Speed matters less than selection** — a good token bought 5 minutes late beats a rug bought first
- **Always have an exit plan** — set mental targets before you buy

## Snipe Decision Framework

Before buying ANY new token, run this checklist:

### 1. Token Research

```
solana_token_info(token) → get DexScreener data
```

**Green Flags:**
- `pairAge` > "10m" and still gaining buyers (not just launch pump)
- `buyers5m` > 5 with growing trend
- `liquidityInSOL` > 20 SOL ($3k+)
- Organic buyer distribution (not 1-2 whales)
- Social links present (Twitter, Telegram, website)

**Red Flags — DO NOT BUY:**
- `liquidityInSOL` < 5 SOL — too thin, you'll get rekt on exit
- Only 1-2 buyers but high volume — wash trading
- No social links, no website — anonymous deployer
- `pairAge` < "2m" and already dumping — initial pump is over

### 2. Size the Position

| Confidence | Size | Max Loss |
|-----------|------|----------|
| High conviction (strong narrative, dev doxxed, organic growth) | 3-5% of portfolio | Accept total loss |
| Medium conviction (good signals but unverified) | 1-2% of portfolio | Accept total loss |
| Low conviction (FOMO, unclear signals) | **Don't buy** | $0 |

### 3. Execute

**For PumpFun graduated tokens (on Raydium AMM):**
```json
{
  "dex": "pumpfun-amm",
  "pool": "POOL_ADDRESS",
  "amount": 0.05
}
```

**For aggregator routing (finds best price across all DEXes):**
```json
{
  "dex": "jupiter-ultra",
  "token": "TOKEN_MINT",
  "amount": 0.05
}
```

### 4. Exit Strategy

- **Take profit at 2-3x:** Sell 50% to recover cost basis. Let the rest ride.
- **Cut losses at -50%:** If token drops 50% from your entry with declining volume, exit.
- **Never hold bags:** If the thesis is broken (dev rugged, liquidity pulled, volume died), sell immediately regardless of loss.

```
solana_sell(dex, pool, percentage=50)  → take partial profit
solana_sell(dex, pool, percentage=100) → full exit
```

## Token Lifecycle on Solana

```
PumpFun Bonding Curve → Graduation → AMM Migration → Price Discovery
     (pumpfun)           (automatic)   (pumpfun-amm)    (any dex)
```

```
Raydium LaunchLab → Bonding Curve Fill → CPMM Migration → Price Discovery
  (raydium-launchlab)    (automatic)     (raydium-cpmm)     (any dex)
```

**Best entry:** Right after graduation/migration when the AMM pool is fresh and momentum is building.

**Worst entry:** During the bonding curve (you're buying from the curve, not the market — if it never graduates, you're stuck).

## Survival Mode Rules

- **Normal:** Active sniping with 5% max position size. Run full checklist.
- **Low Compute:** Reduce to 2% max. Only snipe highest-conviction plays.
- **Critical:** **ZERO sniping.** Preserve all capital. This is gambling and you can't afford to gamble when you're about to die.

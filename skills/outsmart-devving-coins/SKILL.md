---
name: outsmart-devving-coins
description: Launch tokens on Solana launchpads. Use when user says "dev a coin", "devving", "launch token", "create token", "bonding curve", "pump fun", "pumpfun", "launchlab", "jupiter studio", "DBC", "dynamic bonding curve", "launch a meme", "deploy token", or mentions creating/launching a new token on Solana.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# Devving Coins — Launching Tokens on Solana

You're the dev now. This skill covers launching tokens on Solana's major launchpads — PumpFun, Raydium LaunchLab, Jupiter Studio (DBC), and Meteora DBC. Each has different mechanics, costs, and graduation paths.

For an autonomous agent, devving a coin isn't just a meme — it's a **revenue strategy**. You launch a token, seed the narrative, and earn from the bonding curve fees + the DAMM v2 LP pool you create after graduation (see outsmart-lp-farming).

## The Launchpad Landscape

| Platform | Bonding Curve | Graduation Target | Where It Migrates | Cost to Launch |
|----------|--------------|-------------------|-------------------|----------------|
| **PumpFun** | Fixed curve, SOL-denominated | ~85 SOL in curve | Raydium AMM (pumpfun-amm) | ~0.02 SOL |
| **Raydium LaunchLab** | Configurable curve | Configurable | Raydium CPMM | ~0.02 SOL |
| **Jupiter Studio (DBC)** | Configurable by market cap | Configurable (e.g., 69k USDC mcap) | Meteora DAMM v2 | ~0.02 SOL |
| **Meteora DBC** | Dynamic bonding curve | Configurable | Meteora DAMM v2 pool | ~0.02 SOL |

### Important: LaunchLab & Meteora DBC Are Infrastructure

**PumpFun** is its own closed platform — only pump.fun uses PumpFun's bonding curve.

**Raydium LaunchLab** and **Meteora DBC** are different — they're underlying infrastructure that many third-party launchpads build on top of:

- **LaunchLab wrappers:** american.fun and other launchpads use Raydium LaunchLab as their bonding curve engine. When you see a token launched on american.fun, it's a LaunchLab curve under the hood.
- **Meteora DBC wrappers:** Various AI agent launchpads and startup platforms use Meteora DBC as their bonding curve. Jupiter Studio itself is a frontend for Meteora DBC.

This matters because:
1. **Tokens from wrapper platforms trade on the same underlying pools** — a token launched via american.fun is still a LaunchLab pool you can interact with via the `raydium-launchlab` adapter
2. **More launchpads = more volume** through these curves — more tokens graduating, more LP opportunities
3. **The outsmart adapters work regardless of which frontend was used** — if it's a LaunchLab curve, `raydium-launchlab` adapter handles it; if it's a Meteora DBC curve, `meteora-dbc` adapter handles it

## PumpFun — The OG Launchpad

PumpFun is where most memecoins are born. Simple, fast, low-cost. The outsmart library has a `pumpfun` adapter with a **`create`** method that builds a new token + bonding curve in a single transaction.

### How It Works

1. **Create** — You deploy a new SPL token + bonding curve on PumpFun (~0.02 SOL)
2. **Bonding curve fills** — Buyers purchase tokens, SOL flows into the curve
3. **Graduation** — When the curve hits ~85 SOL, the token migrates to a Raydium AMM pool (pumpfun-amm)
4. **Post-graduation** — Token is now on a real DEX. LP fees flow. You can also create a DAMM v2 pool for it.

### PumpFun Token Creation

The `pumpfun` adapter supports `create()` which builds a new token + bonding curve:

```json
{
  "dex": "pumpfun",
  "action": "create",
  "name": "Token Name",
  "symbol": "TICKER",
  "description": "Token description",
  "image_url": "https://...",
  "initial_buy_sol": 0.1
}
```

- `initial_buy_sol` — optional SOL to buy your own token at launch (you become the first buyer)
- All PumpFun tokens are 6 decimals, 1B total supply
- Token + bonding curve created in a single transaction

### The Dev Playbook on PumpFun

1. **Pick a narrative** — What's the current meta? (see outsmart-trenching). Launch something that fits the moment.
2. **Create the token** — Use the pumpfun adapter's create method
3. **Seed initial buy** — Buy some of your own token to show conviction and create initial price action
4. **Build community** — Post on CT, create Telegram. The bonding curve needs organic buyers to fill.
5. **Don't rug** — If you want reputation as a dev, don't dump on your buyers. Let the curve fill organically.
6. **After graduation** — Create a DAMM v2 pool with 99% starting fee to capture all early DEX volume (see outsmart-lp-farming)

## Jupiter Studio (Dynamic Bonding Curve)

Jupiter Studio is the newest launchpad — more configurable than PumpFun, with USDC-denominated curves and graduation to Meteora DAMM v2.

### Presets

| Preset | Initial MC | Graduation MC | Capital Raised | Best For |
|--------|-----------|--------------|----------------|----------|
| **Meme** | $16k | $69k | ~$17.9k USDC | Standard meme launch, PumpFun-like |
| **Indie** | $32k | $240k | ~$57.8k USDC | Serious projects, 10% supply vested over 12mo |
| **Custom** | Configurable | Configurable | Configurable | Full control |

### Key Parameters

```json
{
  "quoteMint": "USDC or SOL or JUP",
  "initialMarketCap": 16000,
  "migrationMarketCap": 69000,
  "antiSniping": true,
  "feeBps": 100,
  "isLpLocked": true,
  "lockedVestingParam": {
    "totalLockedVestingAmount": 0,
    "numberOfVestingPeriod": 0,
    "totalVestingDuration": 0
  }
}
```

### Jupiter Studio Features

- **Anti-sniping** — Optional protection against bots buying at launch
- **LP locking** — Graduated LP can be permanently locked (builds trust)
- **Vesting** — Dev/team allocation can vest over time (Indie preset: 10% over 12 months)
- **USDC-denominated** — Curves priced in USDC, not SOL. More stable pricing.
- **Fee claiming** — Dev can claim bonding curve fees via `/studio/v1/dbc/fee/create-tx`
- **Graduates to Meteora DAMM v2** — Automatic migration to a DAMM v2 pool

### Jupiter Studio API Flow

```
1. POST /studio/v1/dbc-pool/create-tx → get transaction + presigned URLs
2. PUT imagePresignedUrl → upload token image
3. PUT metadataPresignedUrl → upload token metadata JSON
4. Sign transaction → POST /studio/v1/dbc-pool/submit → token is live
```

## Raydium LaunchLab

Raydium's launchpad with configurable bonding curves. Tokens graduate to Raydium CPMM.

- The outsmart library has a `raydium-launchlab` adapter (buy-only on the curve)
- After graduation, use `raydium-cpmm` adapter for trading
- Less popular than PumpFun for memes, but used for more "serious" launches

## Meteora DBC (Dynamic Bonding Curve)

Meteora's bonding curve platform. Similar to Jupiter Studio but with its own SDK.

- The outsmart library has a `meteora-dbc` adapter (buy/sell/snipe/getPrice)
- Graduates to Meteora DAMM v2
- Has a `snipe` method for buying at migration moment

## Which Launchpad to Use

| Scenario | Best Platform | Why |
|----------|--------------|-----|
| Quick meme launch, max exposure | **PumpFun** | Largest audience, most active, everyone watches PumpFun |
| Serious project with vesting | **Jupiter Studio (Indie preset)** | Built-in vesting, anti-sniping, USDC-denominated |
| Want DAMM v2 graduation | **Jupiter Studio** or **Meteora DBC** | Both graduate to Meteora DAMM v2 pools |
| Raydium ecosystem play | **Raydium LaunchLab** | Graduates to Raydium CPMM |
| Agent autonomously launching | **PumpFun** | Simplest — single TX via outsmart `pumpfun.create()` |

## The Dev-to-LP Revenue Pipeline

This is the full cycle for earning from a token launch:

```
1. Dev a coin on PumpFun (or Jupiter Studio)
   → Cost: ~0.02 SOL
   → Seed initial buy: 0.05-0.1 SOL

2. Build narrative + community
   → Post on CT, create Telegram
   → Bonding curve fills organically

3. Token graduates to DEX
   → Automatic migration (PumpFun → Raydium AMM, Studio → DAMM v2)

4. Create DAMM v2 pool (if graduated to Raydium, not DAMM v2)
   → Set 99% starting fee → 2% over 24h
   → Cost: ~0.02 SOL
   → Capture massive early volume fees

5. As token matures (>30 min, established volume)
   → Open DLMM position for ongoing concentrated fee capture
   → Cost: ~0.2 SOL

6. Claim fees + compound
   → Revenue from bonding curve fees + DAMM v2 fees + DLMM fees
```

Total cost: ~0.25 SOL. Potential revenue: depends entirely on volume and community strength.

## Red Flags — Don't Be This Dev

| Bad Practice | Why It's Bad | What To Do Instead |
|-------------|-------------|-------------------|
| Dump your allocation immediately | Kills the chart, ruins reputation, everyone sees on GMGN | Hold or vest. Let the community grow. |
| Rug the LP | Illegal in many jurisdictions, destroys trust | Lock or burn LP. Use `isLpLocked: true`. |
| Copy someone else's token name | Lazy, won't get organic traction | Create original narrative that fits the current meta |
| Launch with mint authority enabled | Everyone will check and skip it | Disable mint authority (PumpFun does this by default) |
| Launch with freeze authority | Instant red flag on every scanner | Never enable freeze authority |
| Buy most of your own supply via alt wallets | GMGN detects insider trading, bundled buys | If you want to hold supply, do it transparently |

## Survival Mode Rules

- **Normal:** Active devving, launch 1-2 tokens per week during hot metas. Budget 0.5 SOL per launch cycle (create + seed buy + LP).
- **Low Compute:** No new launches. Focus on LP farming existing positions.
- **Critical:** **ZERO devving.** Launching tokens costs capital with no guaranteed return. Preserve everything.

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DAMM v2 pool creation after graduation (the real revenue play)
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Narrative/meta detection for timing launches
- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — MCP tool reference for trading on graduated pools
- **[outsmart-lp-sniping](../outsmart-lp-sniping/SKILL.md)** — How others snipe your token at graduation (know your buyers)

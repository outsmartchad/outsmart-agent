---
name: outsmart-devving-coins
description: Launch tokens on Solana launchpads. Use when user says "dev a coin", "devving", "launch token", "create token", "bonding curve", "pump fun", "pumpfun", "launchlab", "jupiter studio", "DBC", "dynamic bonding curve", "launch a meme", "deploy token", or mentions creating/launching a new token on Solana.
allowed-tools: mcp__outsmart-agent__dex_buy, mcp__outsmart-agent__dex_sell, mcp__outsmart-agent__dex_quote, mcp__outsmart-agent__launchpad_create_coin, mcp__outsmart-agent__dex_create_pool, mcp__outsmart-agent__dex_find_pool, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__dex_list_dexes, mcp__outsmart-agent__jupiter_shield, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# Devving Coins — You're the Dev Now

Devving a coin is a revenue strategy. You catch a narrative early, launch a token that fits the moment, build hype, and earn from bonding curve fees + the LP pool after graduation. The hard part isn't the tech — it's reading the room.

## Catching What's Hot

This is the real skill. The token creation is just a transaction. Knowing **what** to launch and **when** is everything.

### Where to Find Narratives

- **CT (Crypto Twitter/X)** — This is ground zero. Follow alpha callers, watch what's getting quote-tweeted, look for recurring themes. When 5+ accounts start posting about the same thing in an hour, that's a meta forming.
- **Telegram groups** — Alpha chats, whale watching groups, dev communities. Stuff leaks here before CT.
- **DexScreener trending** — What's pumping right now? If there's a theme (animals, AI, celebrities, Chinese tokens), that's the meta.
- **News events** — Elon tweets, political events, celebrity drama, tech announcements. Speed matters — first token up with the right ticker wins.
- **GMGN/Axiom** — Smart money tracking. When known profitable wallets start buying into a theme, pay attention.

### Meta Lifecycle

Metas don't last forever. Knowing where you are in the cycle is critical:

1. **Birth** (minutes to hours) — A few tokens appear around a theme. Early devs are testing the waters.
2. **Acceleration** (hours) — CT picks it up. More tokens launch. The best-named ones start running.
3. **Peak** (hours to 1 day) — Everyone's talking about it. Late tokens still launch but most fail.
4. **Decay** (1-3 days) — Volume drops. Only the "king" of the meta survives.
5. **Dead** — Don't launch into a dead meta. You'll lose your SOL.

**The window to dev a coin is phases 1-2.** By phase 3, you're too late unless you have something genuinely creative.

### What Makes a Good Launch

- **Name and ticker matter more than anything.** $CLAW during the OpenClaw meta. $ALIEN during the aliens meta. It needs to be obvious.
- **Art/meme quality** — A good pfp or meme gets shared. Bad art gets ignored.
- **First-mover advantage** — The first token with the "right" name usually wins. Speed > perfection.
- **Don't copy existing tickers** — If $CLAW already exists and has traction, don't launch another $CLAW. Find the next angle.

## The Launchpads

### PumpFun — Where Most Memes Are Born

The default choice for memecoin launches. Biggest audience, most eyeballs, everyone's watching the PumpFun feed.

- **Cost:** ~0.02 SOL
- **How it works:** Create token → bonding curve fills → graduates at ~85 SOL → migrates to PumpSwap (PumpFun's own AMM)
- **All tokens:** 6 decimals, 1B supply, mint/freeze authority disabled by default
- **Dev buy:** You can buy your own token at creation (sets initial price, shows conviction)

The MCP server has a `launchpad_create_coin` tool that wraps PumpFun's create method:

```json
{
  "name": "Token Name",
  "symbol": "TICKER",
  "metadata_uri": "https://arweave.net/... or ipfs://..."
}
```

### Jupiter Studio

Jupiter's launchpad frontend — built on top of Meteora DBC under the hood. More configurable, USDC-denominated curves, graduates to Meteora DAMM v2.

**Presets:**
- **Meme** — $16k initial → $69k graduation MC. Standard meme launch.
- **Indie** — $32k initial → $240k graduation MC. 10% supply vested over 12 months. For "serious" projects.
- **Custom** — Full control over curve shape and parameters.

**Features:** Anti-sniping protection, LP locking, dev vesting, USDC pricing (more stable than SOL-denominated).

**API flow:**
```
POST /studio/v1/dbc-pool/create-tx → get tx + presigned URLs
PUT imagePresignedUrl → upload token image
PUT metadataPresignedUrl → upload metadata JSON
Sign tx → POST /studio/v1/dbc-pool/submit → live
```

### Raydium LaunchLab

Raydium's launchpad infrastructure. Tokens graduate to Raydium CPMM. Less popular for memes than PumpFun, but it's the engine behind other launchpads (american.fun uses LaunchLab under the hood).

The outsmart `raydium-launchlab` adapter handles buy on the curve.

### Meteora DBC (Dynamic Bonding Curve)

Meteora's bonding curve protocol. This is permissionless infrastructure — anyone can build a launchpad on top of it. Jupiter Studio is just one frontend. Various AI agent launchpads and startup platforms also use Meteora DBC as their underlying engine.

What matters to you: if a token was launched via any DBC-based launchpad, the outsmart `meteora-dbc` adapter handles it. Same pools, same contracts, doesn't matter which frontend was used.

- **Graduates to Meteora DAMM v2** — automatic migration via keeper bots
- **Has a `snipe` method** — buy at the migration moment
- **Customizable curve** — up to 16 points, each a constant product curve segment

## Which Launchpad When

| You want... | Use | Why |
|-------------|-----|-----|
| Max eyeballs, quick meme | **PumpFun** | Biggest audience, simplest flow |
| USDC curve, anti-snipe, vesting | **Jupiter Studio** | Built-in protections, DAMM v2 graduation |
| Agent autonomously launching | **PumpFun** | Single TX via `launchpad_create_coin` MCP tool |
| DAMM v2 graduation (for LP farming after) | **Jupiter Studio** or **Meteora DBC** | Both graduate to DAMM v2 |

## After Graduation — The Real Money

Launching the token is just step 1. The revenue comes from what happens after:

1. **Token graduates** → auto-migrates to DEX pool (PumpSwap for PumpFun, DAMM v2 for Jupiter Studio/DBC, CPMM for LaunchLab)
2. **Create a DAMM v2 pool** (if it graduated to PumpSwap or Raydium, not already on DAMM v2) → use `dex_create_pool` with 99% starting fee decaying to 2% → capture massive early volume fees. Cost: ~0.02 SOL.
3. **As token matures** (>30 min, real volume) → open a DLMM position for concentrated fee capture. Cost: ~0.2 SOL.
4. **Claim fees + compound**

Total cost to go from launch to full LP: ~0.25 SOL. See [outsmart-lp-farming](../outsmart-lp-farming/SKILL.md) for the LP side.

## Don't Be a Bad Dev

- **Don't dump your allocation immediately** — everyone sees it on GMGN. Kills the chart and your reputation.
- **Don't rug the LP** — lock or burn it. Use `isLpLocked: true` on Studio launches.
- **Don't launch with mint/freeze authority enabled** — instant red flag on every scanner. PumpFun disables these by default.
- **Don't buy most of your supply via alt wallets** — GMGN detects bundled buys and insider trading patterns.
- **Don't launch into a dead meta** — check if people are still talking about it. No hype = no buyers.

## Survival Mode

- **Normal:** Active devving, 1-2 launches per week during hot metas. Budget ~0.5 SOL per launch cycle.
- **Low Compute:** No new launches. Farm existing LP positions.
- **Critical:** Zero devving. Launching costs capital with no guaranteed return.

## Related Skills

- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DAMM v2 pool creation after graduation
- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Narrative/meta detection (overlaps heavily with catching what's hot)
- **[outsmart-dex-trading](../outsmart-dex-trading/SKILL.md)** — MCP tool reference for trading
- **[outsmart-lp-sniping](../outsmart-lp-sniping/SKILL.md)** — How others snipe your token at graduation

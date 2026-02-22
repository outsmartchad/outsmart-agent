---
name: outsmart-lp-sniping
description: Snipe tokens at LP creation on Solana. Use when user says "snipe", "sniping", "bonding curve", "graduation", "migration", "new pool", "LP created", "snipe LP", "gRPC", "bloom bot", "set up snipe", or mentions buying a token the instant its LP pool goes live.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# LP Sniping Strategy

Sniping is buying a token **the instant its LP pool is created on a DEX**. You already know the token address before the pool exists. You're waiting for liquidity to appear, then buying in the same block or the next few blocks.

This is not "find a new token and evaluate it." This is "I already have the mint address, I'm watching for the LP event, and I'm buying the millisecond it lands."

## How Sniping Actually Works

```
[1] You discover a token BEFORE it has DEX liquidity
    - It's on a PumpFun bonding curve, filling up
    - It's on Raydium LaunchLab, nearing graduation
    - You saw the mint address on CT, Telegram, or from a dev
    - An agent detected it via on-chain monitoring

[2] You set up a snipe — one of two methods:
    a) Run a gRPC listener that streams DEX transactions,
       watching for an addLiquidity/createPool TX that includes your mint
    b) Copy the mint address into a sniping bot (Bloom, Trojan, BonkBot)
       and configure amount + slippage

[3] The moment LP is created:
    - gRPC listener detects the pool creation TX
    - Your buy TX fires immediately — same block or next block
    - You're in before most people even see the pool on DexScreener

[4] Price discovery happens. You're already in.
```

## The Two Sniping Methods

### Method A: gRPC Background Listener (Programmatic)

A background process runs a Yellowstone gRPC subscription, streaming transactions from DEX programs. When it sees a `createPool` or `addLiquidity` instruction that includes your target mint address, it fires a buy.

**How it works:**
```
gRPC stream (Yellowstone/Triton)
    → filter by DEX program IDs (Raydium, Meteora, PumpFun migration, etc.)
    → parse each TX for instruction discriminators
    → extract mint addresses from account keys
    → IF target mint found in new pool creation → FIRE BUY TX
```

**Key details:**
- Requires a Yellowstone gRPC endpoint (`GRPC_URL` + `GRPC_XTOKEN`)
- Streams ALL DEX transactions, filters locally for your target mint
- Latency: ~400ms from pool creation to your buy TX landing
- This is what serious snipers and trading bots use

**Program IDs to watch:**
| DEX | Program | Pool Creation Event |
|-----|---------|-------------------|
| PumpFun → Raydium migration | `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` | `MigrateToRaydium` instruction |
| Raydium CPMM | `CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C` | `initialize` instruction |
| Raydium AMM v4 | `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8` | `initialize2` instruction |
| Meteora DAMM v2 | `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` | `createCustomizablePool` instruction |
| Meteora DLMM | `LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo` | `initializePosition` instruction |
| Meteora DBC | Dynamic bonding curve program | Pool creation after curve completion |

> **Note:** gRPC sniping is Phase E in the outsmart roadmap. The infrastructure isn't built yet — when it is, it will be exposed as MCP tools (`stream_subscribe`, `stream_events`).

### Method B: Sniping Bot (Manual Setup)

Copy the token mint address into a third-party sniping bot:

| Bot | How to Use | Notes |
|-----|-----------|-------|
| **Bloom Bot** | Paste mint in Telegram, set amount + slippage | Popular, supports PumpFun graduation sniping |
| **Trojan Bot** | Telegram-based, paste address | Fast execution, MEV-protected |
| **BonkBot** | Telegram, paste mint | Simple UX, good for beginners |
| **Axiom** | Web interface, paste mint in snipe tab | Anti-MEV routing, position management |

**Workflow:**
1. Get the mint address (from CT, Telegram alpha group, on-chain scanner)
2. Open your sniping bot
3. Paste the mint address
4. Set buy amount (e.g., 0.5 SOL)
5. Set slippage (usually 15-30% for new launches — high slippage needed because initial price is volatile)
6. Bot watches for pool creation and fires when LP lands

## What to Snipe

### PumpFun Graduation Snipe

The most common snipe target. A PumpFun bonding curve token is filling up. When it hits 100% and graduates, it migrates to a Raydium AMM pool. You snipe the migration.

```
PumpFun Bonding Curve (filling) → 100% filled → Migration TX → Raydium AMM Pool Created
                                                                       ↑
                                                              YOUR BUY TX FIRES HERE
```

**How to spot graduation candidates:**
- Token is at 80%+ bonding curve progress on pump.fun
- Active community in Telegram/Twitter pushing it
- Dev hasn't sold their allocation
- Strong narrative (AI, political, animal meme, CT insider)

**After sniping:**
```
solana_sell(dex="pumpfun-amm", pool=POOL, percentage=50)  → take profit at 2-3x
```

### Raydium LaunchLab Snipe

Similar to PumpFun. Token is on a Raydium LaunchLab bonding curve. When it fills, it migrates to Raydium CPMM.

```
LaunchLab Curve → Filled → CPMM Pool Created → YOUR BUY
```

**After sniping:**
```
solana_sell(dex="raydium-cpmm", pool=POOL, percentage=50)
```

### Known Mint Snipe (Pre-Announced)

Sometimes you know a token's mint address before it has any liquidity:
- Dev shared the mint in a private group
- You found it on-chain (token created but no pool yet)
- Project announced a launch time and token address

Set up your gRPC listener or sniping bot with the mint address. Wait for LP.

## Position Sizing

| Scenario | Max Size | Why |
|----------|---------|-----|
| Graduation snipe (strong narrative) | 3-5% of portfolio | Higher conviction, graduated tokens have some validation |
| Unknown mint snipe | 1-2% of portfolio | Less information, higher risk |
| Pure degen play (FOMO) | **0%** | If you can't explain why, don't snipe it |

## Exit Strategy

You need this BEFORE you snipe:

| Target | Action |
|--------|--------|
| **2x** | Sell 50% — you've recovered your cost basis |
| **3-5x** | Sell another 25% — lock in profit |
| **10x+** | Sell remaining or set tight mental stop |
| **-50%** | Full exit. Volume dead, momentum gone. Cut losses. |

```
solana_sell(dex, pool, percentage=50)   → partial take profit
solana_sell(dex, pool, percentage=100)  → full exit
```

## What Can Go Wrong

| Risk | What Happens | Mitigation |
|------|-------------|-----------|
| **Rug pull** | Dev removes liquidity after launch | Size small. Check dev wallet history. |
| **Honeypot** | You can buy but contract blocks sells | Test with tiny amount first (0.001 SOL) |
| **Front-run** | MEV bots buy before you | Use Jito tips, MEV-protected routes |
| **Failed snipe** | TX doesn't land in time, you buy at higher price | Accept it. Don't chase with bigger size. |
| **Bonding curve never fills** | Token stalls at 60-80% on PumpFun | Only set up snipes for curves above 85% |

## Current Limitations

- **gRPC sniping is not yet built** in outsmart-agent (Phase E roadmap). When it ships, it will be available as background MCP tools.
- **For now**, use the MCP `solana_buy` tool to buy immediately after you learn a pool was created — this is manual sniping, not automated block-0 sniping.
- **For automated sniping today**, use a third-party bot (Bloom, Trojan, BonkBot) alongside outsmart-agent for everything else.

## Survival Mode Rules

- **Normal:** Active sniping with 5% max position size per snipe. Full research.
- **Low Compute:** Reduce to 2% max. Only graduation snipes on 90%+ curves with strong narrative.
- **Critical:** **ZERO sniping.** This is the highest-risk strategy. You cannot afford total losses when you're about to die.

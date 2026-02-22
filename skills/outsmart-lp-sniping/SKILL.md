---
name: outsmart-lp-sniping
description: Evaluate and buy tokens at or near LP creation on Solana. Use when user says "snipe", "sniping", "bonding curve", "graduation", "migration", "new pool", "LP created", "snipe LP", "bloom bot", "set up snipe", "pump fun", "launchlab", or mentions buying a token the instant its LP pool goes live.
allowed-tools: mcp__outsmart-agent__solana_buy, mcp__outsmart-agent__solana_sell, mcp__outsmart-agent__solana_quote, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__solana_list_dexes, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# LP Sniping

You know a token exists before it has a pool. You're watching it. The moment liquidity appears, you buy.

## What You Can Do Right Now

Block-0 sniping (gRPC listeners) isn't built yet — that's Phase E. Here's the current playbook:

**1. Evaluate launch candidates** — find tokens worth sniping before they graduate:
- PumpFun bonding curves at 80%+ filled
- LaunchLab curves nearing completion
- Pre-announced mints from CT or private groups
- Tokens going viral that haven't migrated yet

**2. Fast manual buy** — once the pool exists, buy immediately:
```
solana_token_info(token) → verify pool exists
solana_buy(dex="jupiter-ultra", token=MINT, amount=0.05)
```

You won't get block-0, but if you're watching a curve at 95% and buy within seconds of graduation, you're still early.

**3. Delegate to sniping bots** — for actual block-0 execution, use a bot alongside the agent. Bloom Bot, Trojan, BonkBot (Telegram bots), or Axiom (web). The agent identifies targets, the bot handles execution, the agent manages the position after.

## What to Snipe

**PumpFun graduation** — most common target. Bonding curve fills to 100%, migrates to Raydium AMM. Look for: 80%+ progress, active community, dev hasn't sold, fits current meta, smart money is in the curve.

**LaunchLab** — same pattern, graduates to Raydium CPMM.

**Known mints** — sometimes you have the address before the pool exists (dev shared it, project announced, found on-chain).

## Before You Snipe

Run the same security checks as trenching:

1. `solana_token_info(token)` — pool exists? initial liquidity?
2. Jupiter Shield: `GET /ultra/v1/shield?mints={mint}` — freeze/mint authority
3. GMGN — MintDisable, LP burn, rug probability, dev history
4. Bonding curve progress — only >85% filled
5. Narrative check — is this part of something hot?

**Any critical red flag = skip.** Always another launch.

## Position Sizing

- Strong narrative + clean security: 3-5% of portfolio
- Pre-announced, less info available: 1-2%
- FOMO, no research: **0%.** Don't.

## Exit Plan

Decide before you buy:

| Hit | Do |
|-----|-----|
| 2x | Sell 50% — cost basis recovered |
| 3-5x | Sell another 25% |
| 10x+ | Let the rest ride or take it |
| -50% | Full exit. Volume dead, it's over. |

## After — The LP Play

If the token has legs:
1. **< 5 min, big volume** → create DAMM v2 pool with 99% starting fee (see lp-farming skill)
2. **> 30 min, established** → open DLMM position for steady fees

## Risks

- **Rugs** — size small, check dev history on GMGN
- **Honeypots** — Jupiter Shield + test with 0.001 SOL
- **Front-run by MEV** — use Jito tips, or accept you won't get block-0 without a bot
- **Late entry** — don't chase with bigger size, best snipers miss most
- **Stalled curves** — only target >85% with active momentum

## Survival Mode

- **Normal:** Active evaluation, 5% max per snipe, full security checklist
- **Low Compute:** 2% max, only graduation snipes on 90%+ curves with clean security
- **Critical:** Zero sniping. Highest-risk strategy. Can't afford total losses.

## Related Skills

- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Security checklist, meta detection
- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DAMM v2 pool creation after sniping

---
name: outsmart-lp-sniping
description: Buy tokens at or near LP creation on Solana. Use when user says "snipe", "sniping", "bonding curve", "graduation", "migration", "new pool", "LP created", "snipe LP", "bloom bot", "set up snipe", "pump fun", "launchlab", or mentions buying a token the instant its LP pool goes live.
allowed-tools: mcp__outsmart-agent__dex_buy, mcp__outsmart-agent__dex_sell, mcp__outsmart-agent__dex_quote, mcp__outsmart-agent__dex_snipe, mcp__outsmart-agent__dex_find_pool, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__dex_list_dexes, mcp__outsmart-agent__jupiter_shield, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '2.0.0'
---

# LP Sniping

You know the token. You're watching it. The moment liquidity appears, you buy. Speed is everything — you don't stop to run security checks. Snipe first, evaluate after.

## What You Can Do Right Now

Block-0 sniping (gRPC listeners) isn't built yet — that's Phase E. Here's the current playbook:

**1. Spot targets** — find tokens worth sniping before they graduate:
- PumpFun bonding curves at 80%+ filled
- LaunchLab curves nearing completion
- Pre-announced mints from CT or private groups
- Tokens going viral that haven't migrated yet

**2. Snipe** — the moment the pool exists, buy immediately:
```
dex_snipe(dex, pool, token, amount=0.05, tip_sol=0.005)
```
Or if you don't have the pool address yet:
```
dex_buy(dex="jupiter-ultra", token=MINT, amount=0.05)
```

You won't get block-0, but if you're watching a curve at 95% and buy within seconds of graduation, you're still early.

**3. Delegate to sniping bots** — for actual block-0 execution, use a bot alongside the agent. Bloom Bot, Trojan, BonkBot (Telegram bots), or Axiom (web). The agent identifies targets, the bot handles execution, the agent manages the position after.

## What to Snipe

**PumpFun graduation** — most common target. Bonding curve fills to 100%, migrates to PumpSwap. Look for: 80%+ progress, active community, dev hasn't sold, fits current meta, smart money in the curve.

**LaunchLab** — same pattern, graduates to Raydium CPMM.

**Known mints** — sometimes you have the address before the pool exists (dev shared it, project announced, found on-chain).

## Position Sizing

Keep it small. You're buying blind on speed.

- Confident in the narrative: 2-3% of portfolio
- Looks promising but not sure: 1%
- Just want exposure: 0.5%

## After You're In

Now you do your homework. Check if you should hold or dump:

```
solana_token_info(token) → liquidity, volume, buyers, age
```

If something looks off — low organic activity, single wallet holding 30%+, no real volume — sell and move on. You got in cheap, take the small loss.

If it looks good — hold, maybe add more, or move into the LP play.

## Exit Plan

| Hit | Do |
|-----|-----|
| 2x | Sell 50% — cost basis recovered |
| 3-5x | Sell another 25% |
| 10x+ | Let the rest ride or take it |
| -50% | Full exit. Volume dead, it's over. |

## After — The LP Play

If the token has legs:
1. **< 5 min, big volume** → create DAMM v2 pool via `dex_create_pool` with 99% starting fee
2. **> 30 min, established** → open DLMM position for steady fees

## Risks

- **Rugs** — that's why you size small. Evaluate after you're in.
- **Front-run by MEV** — use `dex_snipe` with Jito tips for priority
- **Late entry** — don't chase with bigger size. Best snipers miss most.
- **Stalled curves** — only target >85% with active momentum

## Survival Mode

- **Normal:** Active sniping, 3% max per snipe
- **Low Compute:** 1% max, only graduation snipes on 90%+ curves
- **Critical:** Zero sniping. Can't afford the risk.

## Related Skills

- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Meta detection, where to find targets
- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DAMM v2 pool creation after sniping

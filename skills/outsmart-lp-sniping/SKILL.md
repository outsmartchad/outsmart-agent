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

# LP Sniping Strategy

Sniping is buying a token **at or near the moment its LP pool is created on a DEX**. You already know the token address before the pool exists. You're watching for liquidity to appear, then buying as early as possible.

## What the Agent Can Do Today

**Automated block-0 sniping (gRPC listeners) is NOT built yet** — that's Phase E in the roadmap. Here's what you CAN do right now:

### 1. Evaluate Launch Candidates

Monitor upcoming launches and assess which tokens are worth buying early:

- **PumpFun bonding curves** nearing graduation (80%+ filled)
- **Raydium LaunchLab** curves nearing completion
- **Pre-announced launches** where the mint address is known
- Tokens going viral on CT that haven't migrated to DEX yet

### 2. Fast Manual Buy After LP Creation

Once a pool exists, buy immediately via MCP tools:

```
solana_token_info(token) → verify pool exists, check initial liquidity
solana_buy(dex="jupiter-ultra", token=MINT, amount=0.05) → execute buy
```

This won't get you block-0 entry, but if you're watching a bonding curve at 95% and buy within seconds of graduation, you're still early.

### 3. Delegate Automated Sniping to Third-Party Bots

For actual block-0 execution, use a sniping bot alongside outsmart-agent:

| Bot | How | Notes |
|-----|-----|-------|
| **Bloom Bot** | Paste mint in Telegram, set amount + slippage | Popular for PumpFun graduation sniping |
| **Trojan Bot** | Telegram-based, paste address | Fast execution, MEV-protected |
| **BonkBot** | Telegram, paste mint | Simple UX |
| **Axiom** | Web interface, snipe tab | Anti-MEV routing, position management |

**Workflow:** Agent identifies the target → user sets up the snipe in a bot → bot handles block-0 execution → agent manages the position afterward (take profits, LP, etc.)

## What to Snipe

### PumpFun Graduation

The most common snipe target. A PumpFun bonding curve fills to 100% and migrates to a Raydium AMM pool.

```
PumpFun Bonding Curve (filling) → 100% filled → Migration TX → Raydium AMM Pool Created
                                                                       ↑
                                                              BUY HERE (as fast as possible)
```

**How to spot graduation candidates:**
- Token is at 80%+ bonding curve progress
- Active community pushing it on CT/Telegram
- Dev hasn't sold their allocation
- Strong narrative fit (current meta — see outsmart-trenching skill)
- Smart money wallets are in the bonding curve (check GMGN)

### Raydium LaunchLab

Same pattern as PumpFun. Token on a Raydium LaunchLab bonding curve migrates to Raydium CPMM when filled.

### Known Mint (Pre-Announced)

Sometimes you know a token's mint address before it has liquidity:
- Dev shared the mint in a private group or on CT
- Project announced a launch time and token address
- You found it on-chain (token created but no pool yet)

## Evaluation Checklist

Before sniping, run the same security checks as trenching (see outsmart-trenching skill):

```
1. solana_token_info(token) → check if pool exists yet, initial liquidity
2. Jupiter Shield: GET /ultra/v1/shield?mints={mint} → freeze/mint authority
3. GMGN security checks → MintDisable, LP burn, rug probability, dev history
4. Check bonding curve progress (if applicable) → only snipe >85% filled curves
5. Assess narrative strength → is this part of a hot meta?
```

**If any critical red flag (freeze authority, dev rug history, honeypot) → SKIP.** There will always be another launch.

## Position Sizing

| Scenario | Max Size | Why |
|----------|---------|-----|
| Graduation snipe (strong narrative + clean security) | 3-5% of portfolio | Higher conviction, graduated tokens have some validation |
| Known mint snipe (pre-announced) | 1-2% | Less information available pre-launch |
| FOMO snipe (no research) | **0%** | If you can't explain why, don't snipe it |

## Exit Strategy

Decide BEFORE you buy:

| Target | Action |
|--------|--------|
| **2x** | Sell 50% — recovered cost basis |
| **3-5x** | Sell another 25% — locked in profit |
| **10x+** | Sell remaining or let it ride |
| **-50%** | Full exit. Volume dead, momentum gone. |

```
solana_sell(dex="jupiter-ultra", token=MINT, percentage=50)   → partial take profit
solana_sell(dex="jupiter-ultra", token=MINT, percentage=100)  → full exit
```

### After Sniping → LP Pipeline

If the token has legs (volume sustaining, community active):
1. **< 5 min old, big volume** → Create DAMM v2 pool, capture early fees (see outsmart-lp-farming)
2. **> 30 min, established** → Open DLMM position for ongoing fee capture

## Risks

| Risk | Mitigation |
|------|-----------|
| **Rug pull** | Size small. Check dev wallet history on GMGN. |
| **Honeypot** | Jupiter Shield check. Test with tiny amount (0.001 SOL). |
| **Front-run by MEV bots** | Use Jito tips. Or accept you won't get block-0 without a dedicated bot. |
| **Failed snipe (late entry)** | Accept it. Don't chase with bigger size. The best snipers miss most. |
| **Bonding curve stalls** | Only target curves >85% filled with active momentum. |

## Future: gRPC Sniping (Phase E)

When built, gRPC sniping will provide:
- Yellowstone gRPC stream filtering DEX program transactions
- Auto-detection of pool creation for target mints
- Sub-second buy execution (same block or next block)
- Exposed as MCP tools (`stream_subscribe`, `stream_events`)

Until then, use the evaluation + manual buy + third-party bot workflow described above.

## Survival Mode Rules

- **Normal:** Active launch evaluation, 5% max per snipe. Full security checklist.
- **Low Compute:** Reduce to 2% max. Only graduation snipes on 90%+ curves with strong narrative and clean security.
- **Critical:** **ZERO sniping.** Highest-risk strategy. Cannot afford total losses when dying.

## Related Skills

- **[outsmart-trenching](../outsmart-trenching/SKILL.md)** — Security checklist, meta detection, smart money signals
- **[outsmart-lp-farming](../outsmart-lp-farming/SKILL.md)** — DAMM v2 pool creation after sniping, LP pipeline

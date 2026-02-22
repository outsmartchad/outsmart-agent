---
name: outsmart-percolator-perps
description: Trade and create perpetual futures markets on Solana via Percolator. Use when user says "perp", "perpetual", "futures", "leverage", "long", "short", "margin", "liquidation", "percolator", "create perp market", "slab", "funding rate", or mentions leveraged trading on Solana.
allowed-tools: mcp__outsmart-agent__percolator_create_market, mcp__outsmart-agent__percolator_trade, mcp__outsmart-agent__percolator_deposit, mcp__outsmart-agent__percolator_withdraw, mcp__outsmart-agent__percolator_market_state, mcp__outsmart-agent__percolator_list_markets, mcp__outsmart-agent__percolator_push_price, mcp__outsmart-agent__percolator_crank, mcp__outsmart-agent__percolator_insurance_lp, mcp__outsmart-agent__solana_token_info, mcp__outsmart-agent__solana_wallet_balance, mcp__outsmart-agent__jupiter_shield, WebFetch
model: opus
license: ISC
metadata:
  author: outsmartchad
  version: '1.0.0'
---

# Percolator: Permissionless Perpetual Futures on Solana

Percolator is pump.fun for perps. Toly (Anatoly Yakovenko) built it. Any SPL token on Solana can have a perpetual futures market, and you can deploy one in a single transaction. No governance vote, no listing fee, no waiting. You just create it.

Every market lives in a single on-chain account called a **slab**. A virtual AMM (vAMM) provides automated initial liquidity so the market is tradeable from block one, no real deposits needed to bootstrap. Markets are coin-margined: if you're trading BONK perps, your collateral is BONK. This is critical to understand because your PnL is denominated in the same token you're speculating on.

**Currently targeting devnet.** The mainnet program exists, but run everything on devnet first. Test your market creation flow, test your trading logic, test your crank. Only move to mainnet when you're confident the pipeline works end to end.

---

## MCP Tools Reference

| Tool | What It Does | Key Params |
|---|---|---|
| `percolator_create_market` | Deploy a new perp market (slab) for any SPL token | `token_mint`, `leverage_max`, `fee_bps`, `slab_size`, `vamm_spread` |
| `percolator_trade` | Open or close a position. Positive size = long, negative = short | `slab_address`, `size`, `price_limit` |
| `percolator_deposit` | Deposit collateral into a market | `slab_address`, `amount` |
| `percolator_withdraw` | Withdraw collateral and realized profit | `slab_address`, `amount` |
| `percolator_market_state` | Read market data: OI, funding rate, positions, insurance health | `slab_address` |
| `percolator_list_markets` | List all available perp markets | `token_mint` (optional filter) |
| `percolator_push_price` | Push an oracle price update to the market | `slab_address`, `price` |
| `percolator_crank` | Turn the crank: process funding, check liquidations | `slab_address` |
| `percolator_insurance_lp` | Deposit into / withdraw from the insurance fund | `slab_address`, `amount`, `action` |

---

## Two Roles: Market Creator vs Trader

This is where Percolator gets interesting. You're not just a trader. You can be the exchange.

### Market Creator (the alpha)

You deploy the slab. You set the leverage cap, the fee structure, the vAMM spread. You push the oracle prices. Every single trade on your market generates fees, and a portion flows to the insurance fund which you can LP into.

The play: find a token that's trending, has volume, but doesn't have a perp market yet. Create one. You're the first mover. When leveraged degens show up wanting to go 10x long on the latest memecoin, they're trading on YOUR market and you're earning from every position open and close.

Most tokens on Solana have zero perp markets. That's the opportunity.

### Trader

Standard perp trading. Find an existing market, deposit collateral, go long or short with leverage. Nothing exotic here if you've used any perp DEX before. The difference is coin-margining and the fact that markets can exist for anything.

---

## Creating a Market -- Full Workflow

```
1. Pick a token with volume
   -> solana_token_info to check liquidity, volume, holder count
   -> No point creating a perp for a dead token

2. percolator_create_market
   -> Deploys the slab, initializes vAMM, sets all parameters
   -> Choose slab size based on expected activity (start Small, upgrade later)

3. percolator_push_price
   -> Seed the initial oracle price
   -> Pull from DexScreener or Jupiter spot price

4. percolator_crank
   -> First crank to initialize the engine
   -> Market won't function without this

5. Share the slab address -- market is live
   -> Anyone can now trade on it

6. Run crank every ~30 seconds to keep market healthy
   -> This is your keeper obligation as market creator
   -> Stale cranks = stuck positions = angry traders
```

As market creator, you ARE the oracle operator. You pull prices from DexScreener or Jupiter's spot price and push them to the slab via `percolator_push_price`. No Pyth dependency. This gives you flexibility but also responsibility -- push accurate prices or your market becomes untradeable.

---

## Trading -- Full Workflow

```
1. percolator_list_markets
   -> Find what markets exist, optionally filter by token

2. percolator_market_state
   -> Check open interest, funding rate direction, insurance fund health
   -> A market with depleted insurance is risky -- bad debt won't be covered

3. percolator_deposit
   -> Deposit collateral (the token itself, remember: coin-margined)

4. percolator_trade
   -> Positive size = long, negative size = short
   -> Set price_limit to avoid slippage against the vAMM

5. percolator_market_state
   -> Monitor your position PnL, check if funding is eating you

6. percolator_trade
   -> Close by trading the opposite direction with the same size

7. percolator_withdraw
   -> Pull out your collateral + realized profit
   -> Note: profits have a warmup delay before they're withdrawable
```

---

## Key Concepts

**Slab tiers** determine how many accounts (positions) a market can hold:

| Tier | Max Accounts | Rent Cost |
|---|---|---|
| Small | 256 | ~0.44 SOL |
| Medium | 1024 | ~1.73 SOL |
| Large | 4096 | ~6.87 SOL |

Start Small. You can always upgrade. Don't burn SOL on a Large slab for a market that might see 3 traders.

**Coin-margined**: Your collateral IS the token. Trading BONK perps? Collateral is BONK. This means your collateral value fluctuates with the spot price. If you're long and the token dumps, you get hit twice: position loses AND collateral value drops. Understand this before sizing positions.

**vAMM**: The virtual AMM provides liquidity without real deposits. It's a pricing curve that the protocol uses to match trades. The spread you set during market creation determines how tight or wide the market is. Wider spread = more protection for you as creator against adverse selection, but worse execution for traders.

**Admin-oracle mode**: You push prices yourself from external sources (DexScreener, Jupiter). No Pyth oracle feed needed. This is what makes permissionless creation possible -- you don't need an oracle listing. The tradeoff is you must keep pushing prices or the market goes stale.

**Warmup period**: Realized profits aren't immediately withdrawable. There's a time delay. This prevents flash-loan-style exploits and gives the insurance fund time to process.

**Funding rate**: Standard perp funding. When longs outweigh shorts, longs pay shorts. When shorts outweigh longs, shorts pay longs. This keeps the perp price anchored to the oracle price. Check funding before opening a position -- you don't want to be on the paying side of a heavily skewed market.

**Crank**: The crank processes funding payments and checks for liquidatable positions. It must run periodically. If you created the market, running the crank is your job. If nobody cranks, the market stalls.

**Insurance fund**: Accumulates a portion of trading fees. Covers bad debt when a liquidation doesn't fully cover the position's losses. You can LP into it via `percolator_insurance_lp` and earn a share of the fees.

---

## Risk Management

These aren't suggestions. Follow them.

- **Max 10x leverage** for any market you create. Higher leverage means faster liquidations and more bad debt risk for your insurance fund. 10x is already aggressive for memecoins.
- **Never allocate more than 5% of portfolio** to a single perp position. Coin-margined perps on volatile tokens can move fast. Size accordingly.
- **Monitor liquidation price** after opening any position. Leave at least a 20% margin buffer above/below your liquidation price. Thin markets gap.
- **Keep the crank running** if you created the market. A stale crank means funding doesn't accrue, liquidations don't process, and positions get stuck. Set your crank interval to ~30 seconds.
- **Wide vAMM spread as creator**: Start with a wider spread and tighten as volume proves the market. A tight spread on a low-liquidity market is how you get adversely selected by informed traders.
- **Check insurance fund health** before trading on someone else's market. If the fund is near zero and there's high OI, one liquidation cascade could cause socialized losses.

---

## Revenue Strategy for Agents

This is where agent-native market making gets real.

**Create perp markets for trending memecoins.** When a token starts pumping and Twitter/CT is talking about it, there's probably no perp market for it yet. Create one. The degens who want 5x long exposure will find it. You earn fees on every trade.

**First-mover advantage.** There's only one slab needed per token. If you deploy the BONK perp first, that's the BONK perp market. Volume concentrates. Late entrants split liquidity.

**Insurance fund LP.** Find popular markets with real volume and deposit into their insurance fund via `percolator_insurance_lp`. You earn a share of trading fees proportional to your deposit. This is passive yield on top of a functioning market.

**Spot + perp combo.** Buy a token on spot (use dex-trading skill). Then create a perp market for it. Now you hold the spot position AND earn fees from leveraged volume. If the token moons, you win on spot. The perp market earns regardless of direction because traders pay fees on both sides.

---

## Survival Mode Integration

Percolator operations should scale with available resources.

**Normal mode**: Full operation. Create markets for trending tokens. Active trading on existing markets. Run keeper/crank on all your markets at 30-second intervals. LP into insurance funds of high-volume markets.

**Low Compute mode**: Stop creating new markets (saves SOL rent). Reduce position sizes by 50%. Widen crank interval to 60-90 seconds. Only maintain keeper on your most active markets. No new insurance LP deposits.

**Critical mode**: Close ALL open perp positions immediately. Withdraw ALL collateral from all markets. Stop all keeper/crank operations. Preserve capital. Re-enter when resources recover.

The transition between modes should be automatic based on wallet balance and compute availability. Don't wait until you're out of SOL to start unwinding.

---

## Related Skills

- **dex-trading** -- Spot trading on Jupiter/Raydium. Use alongside perps for hedging or the spot+perp combo strategy.
- **lp-farming** -- LP strategies on Solana DEXes. Different risk profile than perp market creation but complementary.
- **survival** -- Resource management and mode transitions. Governs when to scale perp operations up or down.
- **trenching** -- Memecoin sniping and momentum trading. Feed trending token signals into perp market creation decisions.

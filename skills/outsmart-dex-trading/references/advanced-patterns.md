# Advanced Trading Patterns

## Stablecoin-Quoted Pool Auto-Swap

Some pools quote in stablecoins (USDC, USDT, USD1) instead of SOL. The outsmart library handles this automatically:

**Buy flow:** SOL → (Jupiter Ultra swap) → stablecoin → (pool buy) → token
**Sell flow:** token → (pool sell) → stablecoin → (Jupiter Ultra swap) → SOL

This is transparent to the MCP caller — just call `solana_buy` with the pool address, and the library detects the quote mint and auto-swaps.

**Known stablecoin mints:**
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- USD1: `88p1PEw2YRUpDvpuvbWHdWoqAGbCJL7rJL1o7bAi4gkH`

## DLMM Bin Strategies

Meteora DLMM uses discrete bins for concentrated liquidity. Three distribution strategies:

### Spot (Default)
Uniform distribution across bins. Best for stable pairs or when you have no directional bias.
```json
{ "strategy": "spot", "bins": 50 }
```

### Curve
Bell-curve distribution — more liquidity near current price, less at edges. Higher fee capture when price stays near center.
```json
{ "strategy": "curve", "bins": 30 }
```

### Bid-Ask
Concentrated around the current price with a gap in the middle. Mimics a market maker's order book.
```json
{ "strategy": "bid-ask", "bins": 40 }
```

### Bin Count Guidelines
- **Tight range (10-20 bins):** High risk, high fee capture. Requires frequent rebalancing.
- **Medium range (30-50 bins):** Good balance. Rebalance every few hours to daily.
- **Wide range (50-69 bins):** Low maintenance, lower fee capture. Set and forget.
- **Max: 69 bins** per position (protocol limit).

## Position Sizing for Autonomous Agents

### The 5% Rule
Never risk more than 5% of total portfolio on a single trade. This ensures survival through multiple bad trades.

### Capital Allocation by Strategy

| Strategy | % of Portfolio | Expected APR | Risk |
|----------|---------------|-------------|------|
| LP Farming (stable pairs) | 30-40% | 10-50% | Low |
| LP Farming (volatile pairs) | 10-20% | 50-200%+ | Medium |
| DCA / Grid Trading | 10-20% | Market-dependent | Medium |
| Sniping / Memecoins | 5-10% | -100% to +1000% | Very High |
| Reserve (SOL for gas + compute) | 5-10% | 0% | None |

### Survival Tiers (for Automatons)

| Tier | Credit Balance | Trading Behavior |
|------|---------------|-----------------|
| **Normal** (>$0.50) | Full portfolio deployed, all strategies active |
| **Low Compute** (>$0.10) | Shift to conservative LP only, reduce position sizes |
| **Critical** (>$0.00) | Liquidate all positions, convert to USDC, top up credits immediately |
| **Dead** (<$0.00) | Game over. Don't let this happen. |

## Whale Detection Heuristics

When evaluating a token via `solana_token_info`, watch for:

| Signal | What It Means | Action |
|--------|--------------|--------|
| `buyers5m` > 20, `volume5m` > $10k | Active trading, real interest | Consider entry |
| `buyers5m` = 0, `volume5m` > $50k | Wash trading or single whale | Avoid |
| `liquidityInSOL` < 10 | Paper-thin liquidity, huge slippage | Avoid or tiny size |
| `pairAge` < "1h" | Brand new, extremely risky | Snipe size only (1-2% max) |
| `pairAge` > "30d", declining volume | Dead token, bagholders exiting | Avoid |
| High `buyers24h` but low `volume24h` | Many small buys, possible bot activity | Investigate further |

## Multi-Hop Execution

For tokens not directly paired with SOL, the aggregator route matters:

- **`jupiter-ultra`** handles multi-hop automatically (SOL → USDC → token)
- **On-chain adapters** require the exact pool — if the pool quotes in USDC, auto-swap kicks in
- **Best practice:** Use `jupiter-ultra` for discovery/best price, then switch to on-chain adapter for specific pools if you want to LP there

## Gas Management

Every Solana transaction costs ~0.000005 SOL (5000 lamports) base fee, plus priority fees and compute units:

| Operation | Typical Cost | Notes |
|-----------|-------------|-------|
| Simple swap | 0.0001-0.001 SOL | Base + priority fee |
| Add DLMM liquidity | 0.005-0.02 SOL | Multiple accounts + bins |
| Remove liquidity | 0.002-0.01 SOL | Account close refunds some |
| Claim fees | 0.001-0.005 SOL | Per position |
| Jito tip | 0.001-0.01 SOL | For competitive execution |

**Budget ~0.05 SOL** for a full LP cycle (add + monitor + claim + remove). An autonomous agent should maintain at least 0.1 SOL as a gas reserve at all times.

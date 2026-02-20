# outsmart-agent

**Trading infrastructure for AI agents and humans on Solana.**

17 DEX adapters. 12 TX landing providers. Full on-chain read/write/listen stack. One SDK.

```typescript
import { getDexAdapter } from "outsmart-agent";
import "outsmart-agent/dex/raydium-cpmm";

const cpmm = getDexAdapter("raydium-cpmm");
const result = await cpmm.buy({ tokenMint: "...", amountSol: 0.1 });
```

> **Under active development.** For the CLI, see [outsmart-cli](https://github.com/outsmartchad/outsmart-cli).

---

## Why This Exists

Most AI agents that claim to "trade on Solana" are wrappers around a single API endpoint. They can't choose which DEX to route through, can't provide liquidity, can't snipe new pools, and can't land transactions competitively. They delegate everything to a third-party aggregator and hope for the best.

**outsmart-agent** is different. It's a complete on-chain trading infrastructure — a programmatic SDK for AI agents and humans — that gives direct, low-level access to every major Solana DEX protocol.

### The Three Layers

An agent that actually operates on-chain needs three capabilities:

| Layer | What it does | How outsmart-agent implements it |
|-------|-------------|----------------------------------|
| **Write** | Submit transactions — swaps, LP, sniping | 17 DEX adapters build raw instructions, 12 TX landing providers race to land them on-chain |
| **Read** | Query on-chain state — pool prices, positions, balances | Direct RPC calls to decode pool accounts, vault balances, position states. No API middleman. |
| **Listen** | React to real-time events — new pools, price moves | gRPC streams (Yellowstone) + WebSocket subscriptions for pool creation monitoring *(coming soon)* |

Most tools give you **Write** through an aggregator. outsmart-agent gives you all three, with the code-level control to choose exactly which DEX, which pool, which landing provider, and which submission strategy to use.

### Why This Matters for Agents

When an AI agent (OpenClaw, or your own) needs to execute a trade, it shouldn't be a black box. The agent should be able to:

- **Pick the DEX** — Route through Raydium CPMM for deep liquidity, or hit a Meteora DLMM pool for tighter spreads, or use Jupiter Ultra for aggregated routing. The agent decides based on the situation, not a hardcoded default.
- **Control execution** — Set slippage, compute budget, MEV tips. Send through Jito bundles or blast through 12 providers concurrently. Use durable nonces to prevent duplicate buys.
- **Provide liquidity** — Not just swap. Create LP positions on Meteora DAMM v2 or DLMM pools, collect fees, rebalance. Agents that can LP are agents that can earn yield.
- **Read the chain directly** — Decode pool state from raw account data. Calculate prices from on-chain reserves, not from a cached API. Know the real price at the moment of execution.
- **Listen and react** — Subscribe to pool creation events via gRPC. Snipe new tokens the moment liquidity appears. React to on-chain events in real time, not on a polling interval.

---

## MCP Tool Server

outsmart-agent exposes itself to AI agents via [MCP (Model Context Protocol)](https://modelcontextprotocol.io) — the standard way AI agents call external tools. Every `IDexAdapter` method maps to an MCP tool:

```
MCP Tools exposed by outsmart-agent:

  buy           → adapter.buy({ dex, token, amount, ... })
  sell          → adapter.sell({ dex, token, percentage, ... })
  snipe         → adapter.snipe({ dex, token, pool, tip, ... })
  add_liq       → adapter.addLiquidity({ dex, pool, amountA, ... })
  remove_liq    → adapter.removeLiquidity({ dex, pool, percentage, ... })
  get_price     → adapter.getPrice({ dex, pool })
  find_pool     → adapter.findPool({ dex, token, quote })
  list_dex      → registry.listDexAdapters()
  claim_fees    → adapter.claimFees({ dex, pool })
```

Any MCP-compatible agent — OpenClaw, Claude, or your own — can call these tools without knowing anything about Solana internals. The agent says "buy 0.1 SOL of token X on raydium-cpmm", outsmart-agent handles the rest: pool discovery, slippage calculation, instruction building, TX landing through 12 providers.

---

## outsmart-agent + OpenClaw

outsmart-agent handles the **code layer** — raw RPC writes, on-chain reads, gRPC listeners. It's the muscle.

[OpenClaw](https://github.com/AnomalyCo/OpenClaw) handles the **browser layer** — it has a hand and eye that can navigate DeFi frontends, click buttons, sign transactions through wallet extensions, and interact with dApps that don't expose APIs. It's the hands.

Together, they cover the full surface area of Solana DeFi:

```
                    outsmart-agent (code layer)         OpenClaw (browser layer)
                    ───────────────────────────         ────────────────────────
Write (txns)        RPC → raw instructions → land       Browser → wallet → sign → submit
Read (state)        RPC → decode accounts → parse       Browser → scrape UI → extract
Listen (events)     gRPC/WebSocket → stream → react     Browser → poll pages → detect
```

An agent using both can do things neither could alone: snipe a new pool via gRPC stream (outsmart-agent), then go to the project's website to verify the token metadata (OpenClaw), then provide liquidity on the optimal DEX (outsmart-agent), then monitor the position through a dashboard (OpenClaw).

### The Trencher's Toolkit

Real on-chain traders don't just use DEXes. They live on a handful of sites that aggregate token intelligence, LP analytics, and market data. An agent that can actually trade needs to know these sites and use them the way a human trencher would:

| Site | What trenchers use it for | How the agent uses it |
|------|--------------------------|----------------------|
| [GMGN](https://gmgn.ai) | Smart money tracking, wallet profiling, new token discovery, insider activity detection | OpenClaw browses GMGN to check who's buying, spot smart money wallets accumulating, and flag insider-heavy tokens before outsmart-agent executes |
| [Axiom](https://axiom.trade) | Fast trading terminal, real-time charts, quick snipe UI | OpenClaw reads Axiom's token pages for sentiment, holder distribution, and recent trade flow |
| [LPAgent](https://app.lpagent.io/) | LP position management, fee analytics, pool selection, yield tracking | OpenClaw monitors LP positions via LPAgent dashboards, checks fee APR across pools, and feeds that data back so outsmart-agent can rebalance or exit positions |
| [DexScreener](https://dexscreener.com) | Price charts, liquidity depth, market cap, volume, social links | outsmart-agent queries DexScreener API directly. OpenClaw reads the social links and project pages that DexScreener surfaces |

The pattern: **outsmart-agent reads the chain, OpenClaw reads the internet.** outsmart-agent executes trades at the code level, OpenClaw gathers the intelligence that informs those trades. Neither is complete without the other.

---

## SDK Usage

```typescript
import { getDexAdapter, listDexAdapters } from "outsmart-agent";

// Import only the adapters you need
import "outsmart-agent/dex/raydium-cpmm";
import "outsmart-agent/dex/jupiter-ultra";
import "outsmart-agent/dex/meteora-damm-v2";

// Buy tokens
const cpmm = getDexAdapter("raydium-cpmm");
const buyResult = await cpmm.buy({
  tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  amountSol: 0.1,
  opts: { slippageBps: 300, tipSol: 0.001 },
});
console.log("Buy TX:", buyResult.txSignature);

// Sell tokens
const sellResult = await cpmm.sell({
  tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  percentage: 100,
  opts: { slippageBps: 300 },
});

// Add liquidity
const damm = getDexAdapter("meteora-damm-v2");
const lpResult = await damm.addLiquidity!({
  poolAddress: "POOL_ADDRESS",
  amountA: 1.0,
});

// Remove liquidity
const removeResult = await damm.removeLiquidity!({
  poolAddress: "POOL_ADDRESS",
  percentage: 100,
});

// Claim fees
const claimResult = await damm.claimFees!({
  poolAddress: "POOL_ADDRESS",
});

// Read on-chain price
const price = await cpmm.getPrice!("POOL_ADDRESS");
console.log("Price:", price.price);

// Discover pools
const pool = await cpmm.findPool!("TOKEN_MINT");
console.log("Pool:", pool?.address);

// List adapters and capabilities
const adapters = listDexAdapters();
console.log(adapters.map(a => `${a.name}: ${a.protocol}`));
```

---

## DEX Adapters

17 adapters covering every major Solana DEX protocol:

| Adapter | Protocol | Buy | Sell | Snipe | Pool | Price | LP |
|---------|----------|:---:|:----:|:-----:|:----:|:-----:|:--:|
| raydium-amm-v4 | AMM v4 | x | x | x | x | x | |
| raydium-cpmm | CPMM | x | x | x | x | x | |
| raydium-clmm | CLMM | x | x | x | x | x | |
| raydium-launchlab | Launchlab | x | | | x | x | |
| meteora-damm-v1 | Dynamic AMM | x | x | x | x | x | |
| meteora-damm-v2 | CpAmm | x | x | x | x | x | add/remove/claim |
| meteora-dlmm | DLMM | x | x | x | | x | |
| meteora-dbc | DBC | x | x | x | | x | |
| meteora-lp-dlmm | DLMM LP | | | | | | add/remove |
| orca | Whirlpool | x | x | x | | x | |
| byreal-clmm | CLMM | x | x | x | | x | |
| pancakeswap-clmm | CLMM | x | x | x | | x | |
| fusion-amm | Fusion | x | x | x | | x | |
| futarchy-amm | Futarchy | x | x | x | | x | |
| futarchy-launchpad | Launchpad | | | | | | fund/claim |
| jupiter-ultra | Ultra API | x | x | | | | |
| dflow | Intent | x | x | | | | |

## TX Landing Providers

12 providers with concurrent, race, random, and sequential submission strategies:

**Jito, bloXroute, Helius Sender, Nozomi, Blockrazor, NextBlock, 0slot, Soyas, Astralane, Stellium, Flashblock, Node1**

The orchestrator sends your transaction through all enabled providers simultaneously for fastest landing. Durable nonce accounts prevent duplicate executions when the same transaction hits multiple providers concurrently.

---

## Architecture

```
src/
├── index.ts               # SDK entry point
├── mcp/                   # MCP tool server (coming soon)
│   └── server.ts          # MCP server exposing all adapter methods
├── dex/
│   ├── types.ts           # IDexAdapter interface, params, results
│   ├── index.ts           # DexRegistry singleton
│   ├── shared/
│   │   └── clmm-base.ts   # Shared CLMM base class
│   └── 17 adapter files   # One per DEX protocol
├── dexscreener/           # Market data (DexScreener API)
├── helpers/               # Config, wallet, connection, Token-2022 utils
└── transactions/
    └── landing/
        ├── orchestrator.ts    # Multi-provider concurrent submission
        ├── nonce-manager.ts   # Durable nonce for dedup
        ├── tip-accounts.ts    # Tip account registry
        └── providers/         # 12 provider implementations
```

Each DEX adapter implements `IDexAdapter` and self-registers with the `DexRegistry` on import. Import only the adapters you need — no bloat.

---

## Roadmap

- [x] 17 DEX adapters with unified IDexAdapter interface
- [x] 12 TX landing providers with concurrent submission
- [x] Full LP lifecycle (add/remove/claim fees) on Meteora DAMM v2
- [ ] MCP tool server — expose all adapter methods to AI agents
- [ ] OpenClaw integration — browser intelligence from GMGN, Axiom, LPAgent, DexScreener
- [ ] gRPC-powered snipe streaming — completes the Listen layer
- [ ] Hybrid agent workflows — snipe-with-verification, LP management with APR tracking
- [ ] More DEX adapters as new protocols launch

---

## Related

- **[outsmart-cli](https://github.com/outsmartchad/outsmart-cli)** — The CLI for humans. Same trading engine, terminal interface.
- **[OpenClaw](https://github.com/AnomalyCo/OpenClaw)** — Browser automation for AI agents. The hands to outsmart-agent's muscle.

## Discord

https://discord.gg/dc3Kh3Y3yJ

## Contributing

Contributions welcome. Fork, branch, PR.

## Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk. The authors take no responsibility for any financial loss. Users are responsible for ensuring compliance with applicable laws.

Never share your private keys.

## License

ISC

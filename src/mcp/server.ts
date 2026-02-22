#!/usr/bin/env node
/**
 * outsmart-agent MCP Server
 *
 * Exposes 32 MCP tools wrapping the `outsmart` trading library + Jupiter APIs + Percolator.
 * Runs over stdio transport — start with `npx outsmart-agent`.
 *
 * DEX Tools (11):
 *   dex_buy, dex_sell, dex_quote, dex_find_pool, dex_snipe,
 *   dex_create_pool, dex_add_liquidity, dex_remove_liquidity,
 *   dex_claim_fees, dex_list_positions, dex_list_dexes
 *
 * Launchpad Tools (1):
 *   launchpad_create_coin
 *
 * Solana Tools (2):
 *   solana_token_info, solana_wallet_balance
 *
 * Jupiter Tools (9):
 *   jupiter_shield,
 *   jupiter_prediction_events, jupiter_prediction_market,
 *   jupiter_prediction_order, jupiter_prediction_positions, jupiter_prediction_claim,
 *   jupiter_dca_create, jupiter_dca_list, jupiter_dca_cancel
 *
 * Percolator Perp Tools (9):
 *   percolator_create_market, percolator_trade, percolator_deposit,
 *   percolator_withdraw, percolator_market_state, percolator_list_markets,
 *   percolator_push_price, percolator_crank, percolator_insurance_lp
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { PublicKey, VersionedTransaction } from "@solana/web3.js";

import {
  getDexAdapter,
  listDexAdapters,
  registerAllAdapters,
  getWallet,
  getConnection,
  checkBalanceByAddress,
  getSPLTokenBalance,
  getInfoFromDexscreener,
  PumpFunAdapter,
  PercolatorAdapter,
  type IDexAdapter,
  type DexCapabilities,
} from "outsmart";

// ---------------------------------------------------------------------------
// Helper: get adapter with error handling
// ---------------------------------------------------------------------------

function getAdapter(dex: string): IDexAdapter {
  try {
    return getDexAdapter(dex);
  } catch (err: any) {
    throw new Error(
      `DEX adapter "${dex}" not found. Use dex_list_dexes to see available adapters. ${err.message}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: format tool result
// ---------------------------------------------------------------------------

function ok(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(message: string): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "outsmart-agent",
  version: "1.0.0-alpha.1",
});

// ---------------------------------------------------------------------------
// Tool: dex_buy
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "dex_buy",
  "Buy tokens with SOL on a Solana DEX. For aggregators (jupiter-ultra, dflow), provide 'token'. For on-chain DEXes (raydium-*, meteora-*, orca, etc.), provide 'pool'.",
  {
    dex: z.string().describe("DEX adapter name (e.g. 'jupiter-ultra', 'raydium-cpmm', 'meteora-dlmm')"),
    pool: z.string().optional().describe("Pool address (required for on-chain DEXes)"),
    token: z.string().optional().describe("Token mint address (required for aggregators)"),
    amount: z.number().positive().describe("Amount of SOL to spend"),
    slippage_bps: z.number().int().min(0).max(10000).optional().describe("Slippage tolerance in basis points (default: 300 = 3%)"),
    tip_sol: z.number().min(0).optional().describe("MEV tip in SOL"),
    dry_run: z.boolean().optional().describe("Simulate without sending (default: false)"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      const result = await adapter.buy({
        tokenMint: args.token,
        amountSol: args.amount,
        poolAddress: args.pool,
        opts: {
          slippageBps: args.slippage_bps,
          tipSol: args.tip_sol,
          dryRun: args.dry_run,
        },
      });
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_sell
// ---------------------------------------------------------------------------

server.tool(
  "dex_sell",
  "Sell tokens for SOL on a Solana DEX. Specify percentage of holdings to sell (0-100).",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().optional().describe("Pool address (required for on-chain DEXes)"),
    token: z.string().optional().describe("Token mint address (required for aggregators)"),
    percentage: z.number().min(0).max(100).describe("Percentage of token holdings to sell (100 = sell all)"),
    slippage_bps: z.number().int().min(0).max(10000).optional().describe("Slippage tolerance in basis points"),
    dry_run: z.boolean().optional().describe("Simulate without sending"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      const result = await adapter.sell({
        tokenMint: args.token,
        percentage: args.percentage,
        poolAddress: args.pool,
        opts: {
          slippageBps: args.slippage_bps,
          dryRun: args.dry_run,
        },
      });
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_quote
// ---------------------------------------------------------------------------

server.tool(
  "dex_quote",
  "Get the current on-chain price from a pool. Reads directly from on-chain state.",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().describe("Pool address to read price from"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.getPrice) {
        return err(`${args.dex} does not support getPrice`);
      }
      const result = await adapter.getPrice(args.pool);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_add_liquidity
// ---------------------------------------------------------------------------

server.tool(
  "dex_add_liquidity",
  "Add liquidity to a pool. Supports DLMM strategies (spot, curve, bid-ask) and bin configuration.",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().describe("Pool address to add liquidity to"),
    amount_sol: z.number().min(0).optional().describe("Amount of SOL to deposit"),
    amount_token: z.number().min(0).optional().describe("Amount of the non-SOL token to deposit"),
    token_mint: z.string().optional().describe("Token mint (required for single-sided token deposits)"),
    strategy: z.enum(["spot", "curve", "bid-ask"]).optional().describe("Liquidity distribution strategy (DLMM only, default: spot)"),
    bins: z.number().int().min(1).max(70).optional().describe("Number of bins to spread across (DLMM only, default: 50)"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.addLiquidity) {
        return err(`${args.dex} does not support addLiquidity`);
      }
      const result = await adapter.addLiquidity({
        poolAddress: args.pool,
        amountSol: args.amount_sol,
        amountToken: args.amount_token,
        tokenMint: args.token_mint,
        strategy: args.strategy,
        bins: args.bins,
      });
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_remove_liquidity
// ---------------------------------------------------------------------------

server.tool(
  "dex_remove_liquidity",
  "Remove liquidity from a pool. Specify percentage to withdraw (0-100).",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().describe("Pool address"),
    percentage: z.number().min(0).max(100).describe("Percentage of LP position to remove (100 = withdraw all)"),
    position_address: z.string().optional().describe("Specific position address (if multiple positions exist)"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.removeLiquidity) {
        return err(`${args.dex} does not support removeLiquidity`);
      }
      const result = await adapter.removeLiquidity({
        poolAddress: args.pool,
        percentage: args.percentage,
        positionAddress: args.position_address,
      });
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_claim_fees
// ---------------------------------------------------------------------------

server.tool(
  "dex_claim_fees",
  "Claim accumulated swap fees from LP positions in a pool.",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().describe("Pool address"),
    position_address: z.string().optional().describe("Specific position to claim from"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.claimFees) {
        return err(`${args.dex} does not support claimFees`);
      }
      const result = await adapter.claimFees(args.pool, args.position_address);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_list_positions
// ---------------------------------------------------------------------------

server.tool(
  "dex_list_positions",
  "List user's LP positions in a pool. Shows token amounts, fee balances, and in-range status.",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().describe("Pool address"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.listPositions) {
        return err(`${args.dex} does not support listPositions`);
      }
      const result = await adapter.listPositions(args.pool);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: solana_token_info
// ---------------------------------------------------------------------------

server.tool(
  "solana_token_info",
  "Get token market data from DexScreener — price, market cap, volume, liquidity, age, buyers, social links.",
  {
    token: z.string().describe("Token mint address (base58)"),
  },
  async (args) => {
    try {
      const result = await getInfoFromDexscreener(args.token);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_list_dexes
// ---------------------------------------------------------------------------

server.tool(
  "dex_list_dexes",
  "List all available DEX adapters and their capabilities. Optionally filter by capability.",
  {
    capability: z
      .string()
      .optional()
      .describe("Filter by capability: canBuy, canSell, canSnipe, canFindPool, canGetPrice, canAddLiquidity, canRemoveLiquidity, canClaimFees, canListPositions, canCreatePool, isAggregator"),
  },
  async (args) => {
    try {
      let adapters = listDexAdapters();
      if (args.capability) {
        adapters = adapters.filter(
          (a) => a.capabilities[args.capability as keyof DexCapabilities],
        );
      }
      return ok(adapters);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: solana_wallet_balance
// ---------------------------------------------------------------------------

server.tool(
  "solana_wallet_balance",
  "Check SOL balance of the configured wallet. Optionally check a specific SPL token balance.",
  {
    token_mint: z.string().optional().describe("SPL token mint to check balance for (omit for SOL balance)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();
      const address = wallet.publicKey.toBase58();

      if (args.token_mint) {
        const connection = getConnection();
        const tokenMintPubkey = new PublicKey(args.token_mint);
        const tokenBalance = await getSPLTokenBalance(
          connection,
          tokenMintPubkey,
          wallet.publicKey,
        );
        return ok({
          wallet: address,
          token_mint: args.token_mint,
          balance: tokenBalance,
        });
      }

      const connection = getConnection();
      const solBalance = await checkBalanceByAddress(address, connection);
      return ok({
        wallet: address,
        sol_balance: solBalance,
      });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_find_pool
// ---------------------------------------------------------------------------

server.tool(
  "dex_find_pool",
  "Find a pool address for a token pair on a specific DEX. Returns the pool address, base/quote mints, and liquidity info.",
  {
    dex: z.string().describe("DEX adapter name (e.g. 'meteora-damm-v2', 'raydium-cpmm')"),
    base_mint: z.string().describe("Base token mint address (the token you want to trade)"),
    quote_mint: z.string().optional().describe("Quote token mint address (default: WSOL)"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.findPool) {
        return err(`${args.dex} does not support findPool`);
      }
      const result = await adapter.findPool(args.base_mint, args.quote_mint);
      if (!result) {
        return ok({ found: false, message: `No pool found for this pair on ${args.dex}` });
      }
      return ok({ found: true, ...result });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_snipe
// ---------------------------------------------------------------------------

server.tool(
  "dex_snipe",
  "Competitive buy with Jito MEV tip for faster execution. Use for time-sensitive buys where you want priority over other traders.",
  {
    dex: z.string().describe("DEX adapter name"),
    pool: z.string().describe("Pool address to snipe on"),
    token: z.string().describe("Token mint address to buy"),
    amount: z.number().positive().describe("Amount of SOL to spend"),
    tip_sol: z.number().min(0).describe("Jito MEV tip in SOL (e.g. 0.001 for low priority, 0.01 for high)"),
    slippage_bps: z.number().int().min(0).max(10000).optional().describe("Slippage tolerance in basis points"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.snipe) {
        return err(`${args.dex} does not support snipe`);
      }
      const result = await adapter.snipe({
        tokenMint: args.token,
        amountSol: args.amount,
        poolAddress: args.pool,
        tipSol: args.tip_sol,
        opts: {
          slippageBps: args.slippage_bps,
        },
      });
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: dex_create_pool
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "dex_create_pool",
  "Create a new DAMM v2 liquidity pool on Meteora. Two modes: 'custom' (full fee schedule control) or 'config' (use pre-existing on-chain config). The alpha play is being the first pool creator on a new token — set 99% starting fee to capture early volume.",
  {
    mode: z.enum(["custom", "config"]).describe("'custom' for full fee control, 'config' to use a pre-existing on-chain config"),
    base_mint: z.string().describe("Base token mint address (the token)"),
    quote_mint: z.string().optional().describe("Quote token mint (default: WSOL)"),
    base_amount: z.number().min(0).describe("Amount of base token to seed the pool with"),
    quote_amount: z.number().min(0).describe("Amount of quote token (SOL) to seed the pool with"),
    init_price: z.number().positive().optional().describe("Initial price in quote/base units. If omitted, calculated from quoteAmount/baseAmount"),
    // Custom mode params
    max_base_fee_bps: z.number().int().min(0).max(10000).optional().describe("Starting fee in BPS (e.g. 9900 = 99%). Custom mode only."),
    min_base_fee_bps: z.number().int().min(0).max(10000).optional().describe("Ending fee in BPS (e.g. 200 = 2%). Custom mode only."),
    total_duration: z.number().int().positive().optional().describe("Fee decay duration in seconds (e.g. 86400 = 24h). Custom mode only."),
    number_of_period: z.number().int().positive().optional().describe("Number of fee decay steps (e.g. 100). Custom mode only."),
    fee_scheduler_mode: z.number().int().min(0).max(1).optional().describe("0 = linear decay, 1 = exponential decay. Custom mode only."),
    use_dynamic_fee: z.boolean().optional().describe("Enable volatility-based fee surcharge. Custom mode only."),
    collect_fee_mode: z.number().int().min(0).max(1).optional().describe("0 = both tokens, 1 = quote token only. Custom mode only."),
    // Config mode params
    config_address: z.string().optional().describe("On-chain config address. Config mode only."),
    lock_liquidity: z.boolean().optional().describe("Permanently lock initial LP (can NEVER be removed). Config mode only."),
  },
  async (args) => {
    try {
      const adapter = getAdapter("meteora-damm-v2");

      if (args.mode === "custom") {
        if (!adapter.createCustomPool) {
          return err("meteora-damm-v2 adapter does not support createCustomPool");
        }
        if (!args.max_base_fee_bps || !args.min_base_fee_bps || !args.total_duration || !args.number_of_period) {
          return err("Custom mode requires: max_base_fee_bps, min_base_fee_bps, total_duration, number_of_period");
        }
        const result = await adapter.createCustomPool({
          baseMint: args.base_mint,
          quoteMint: args.quote_mint,
          baseAmount: args.base_amount,
          quoteAmount: args.quote_amount,
          initPrice: args.init_price,
          poolFees: {
            maxBaseFeeBps: args.max_base_fee_bps,
            minBaseFeeBps: args.min_base_fee_bps,
            totalDuration: args.total_duration,
            numberOfPeriod: args.number_of_period,
            feeSchedulerMode: args.fee_scheduler_mode ?? 0,
            useDynamicFee: args.use_dynamic_fee ?? false,
          },
          collectFeeMode: args.collect_fee_mode,
        });
        return ok(result);
      } else {
        if (!adapter.createConfigPool) {
          return err("meteora-damm-v2 adapter does not support createConfigPool");
        }
        if (!args.config_address) {
          return err("Config mode requires: config_address");
        }
        const result = await adapter.createConfigPool({
          baseMint: args.base_mint,
          quoteMint: args.quote_mint,
          baseAmount: args.base_amount,
          quoteAmount: args.quote_amount,
          initPrice: args.init_price,
          configAddress: args.config_address,
          lockLiquidity: args.lock_liquidity,
        });
        return ok(result);
      }
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: launchpad_create_coin
// ---------------------------------------------------------------------------

server.tool(
  "launchpad_create_coin",
  "Create a new token on PumpFun with a bonding curve. Deploys a new SPL token (6 decimals, 1B supply, mint/freeze disabled) and creates a bonding curve. The token graduates to PumpSwap AMM when the curve fills (~85 SOL).",
  {
    name: z.string().describe("Token name (e.g. 'My Token')"),
    symbol: z.string().describe("Token ticker (e.g. 'MYTOKEN')"),
    metadata_uri: z.string().describe("Metadata URI — IPFS or Arweave link to JSON metadata with image"),
  },
  async (args) => {
    try {
      const adapter = getAdapter("pumpfun");
      if (!(adapter instanceof PumpFunAdapter)) {
        return err("pumpfun adapter does not support create");
      }
      const result = await adapter.create(args.name, args.symbol, args.metadata_uri);
      return ok({
        ...result,
        note: "positionAddress is the new token mint address. poolAddress is the bonding curve PDA.",
      });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Jupiter API helpers
// ---------------------------------------------------------------------------

function getJupiterApiKey(): string {
  const key = process.env.JUPITER_API_KEY;
  if (!key) throw new Error("JUPITER_API_KEY env var is required for Jupiter API calls. Get one at https://portal.jup.ag");
  return key;
}

async function jupiterGet(path: string, baseUrl = "https://api.jup.ag"): Promise<any> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "x-api-key": getJupiterApiKey() },
  });
  if (!res.ok) throw new Error(`Jupiter API ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function jupiterPost(path: string, body: any, baseUrl = "https://api.jup.ag"): Promise<any> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": getJupiterApiKey() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Jupiter API ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function jupiterDelete(path: string, body?: any, baseUrl = "https://api.jup.ag"): Promise<any> {
  const opts: RequestInit = {
    method: "DELETE",
    headers: { "Content-Type": "application/json", "x-api-key": getJupiterApiKey() },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${path}`, opts);
  if (!res.ok) throw new Error(`Jupiter API ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Deserialize a base64 VersionedTransaction, sign it, and send on-chain */
async function signAndSendJupiterTx(base64Tx: string): Promise<string> {
  const wallet = getWallet();
  const connection = getConnection();
  const tx = VersionedTransaction.deserialize(Buffer.from(base64Tx, "base64"));
  tx.sign([wallet]);
  const sig = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

// ---------------------------------------------------------------------------
// Tool: jupiter_shield
// ---------------------------------------------------------------------------

server.tool(
  "jupiter_shield",
  "Check token security warnings via Jupiter Shield API. Returns freeze authority, mint authority, organic activity warnings. Quick safety check — no signing needed.",
  {
    mints: z.string().describe("Comma-separated token mint addresses to check (e.g. 'MINT1,MINT2')"),
  },
  async (args) => {
    try {
      const result = await jupiterGet(`/ultra/v1/shield?mints=${args.mints}`);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_prediction_events
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "jupiter_prediction_events",
  "Browse prediction market events on Jupiter. Returns events with markets, pricing, and status. Use to find betting opportunities.",
  {
    category: z.string().optional().describe("Filter by category: crypto, sports, politics, esports, culture, economics, tech"),
    status: z.enum(["active", "resolved", "all"]).optional().describe("Event status filter (default: active)"),
    query: z.string().optional().describe("Search query (if provided, uses search endpoint instead)"),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default: 10)"),
  },
  async (args) => {
    try {
      if (args.query) {
        const result = await jupiterGet(`/prediction/v1/events/search?query=${encodeURIComponent(args.query)}&limit=${args.limit ?? 10}`);
        return ok(result);
      }
      let path = `/prediction/v1/events?includeMarkets=true&limit=${args.limit ?? 10}`;
      if (args.category) path += `&category=${args.category}`;
      if (args.status) path += `&filter=${args.status}`;
      const result = await jupiterGet(path);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_prediction_market
// ---------------------------------------------------------------------------

server.tool(
  "jupiter_prediction_market",
  "Get details for a specific prediction market — pricing, orderbook depth, volume, open interest.",
  {
    market_id: z.string().describe("Market ID from jupiter_prediction_events"),
    include_orderbook: z.boolean().optional().describe("Also fetch orderbook depth (default: false)"),
  },
  async (args) => {
    try {
      const market = await jupiterGet(`/prediction/v1/markets/${args.market_id}`);
      if (args.include_orderbook) {
        const orderbook = await jupiterGet(`/prediction/v1/orderbook/${args.market_id}`);
        return ok({ market, orderbook });
      }
      return ok(market);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_prediction_order
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "jupiter_prediction_order",
  "Place a buy or sell order on a Jupiter prediction market. Signs and submits a Solana transaction. Returns order details and tx signature.",
  {
    market_id: z.string().describe("Market ID to trade on"),
    is_yes: z.boolean().describe("true = YES contract, false = NO contract"),
    is_buy: z.boolean().describe("true = buy contracts, false = sell contracts"),
    deposit_amount: z.number().positive().describe("Amount in USD (e.g. 5.0 for $5). Will be converted to micro-USD internally."),
    deposit_mint: z.string().optional().describe("Deposit token mint. Default: USDC (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();
      const depositMint = args.deposit_mint ?? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
      // Convert USD to micro-USD (1 USD = 1,000,000 micro-USD)
      const microUsd = Math.round(args.deposit_amount * 1_000_000);

      const response = await jupiterPost("/prediction/v1/orders", {
        ownerPubkey: wallet.publicKey.toBase58(),
        marketId: args.market_id,
        isYes: args.is_yes,
        isBuy: args.is_buy,
        depositAmount: microUsd,
        depositMint: depositMint,
      });

      if (!response.transaction) {
        return ok(response); // May return error info
      }

      const signature = await signAndSendJupiterTx(response.transaction);

      return ok({
        signature,
        order: response.order,
        note: "Order submitted on-chain. Jupiter keepers will match it. Poll jupiter_prediction_positions to check fill status.",
      });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_prediction_positions
// ---------------------------------------------------------------------------

server.tool(
  "jupiter_prediction_positions",
  "List your open prediction market positions with P&L. Also shows pending orders and trade history.",
  {
    include_orders: z.boolean().optional().describe("Also fetch open orders (default: false)"),
    include_history: z.boolean().optional().describe("Also fetch trade history (default: false)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();
      const pubkey = wallet.publicKey.toBase58();
      const positions = await jupiterGet(`/prediction/v1/positions?ownerPubkey=${pubkey}`);
      const result: any = { positions };

      if (args.include_orders) {
        result.orders = await jupiterGet(`/prediction/v1/orders?ownerPubkey=${pubkey}`);
      }
      if (args.include_history) {
        result.history = await jupiterGet(`/prediction/v1/history?ownerPubkey=${pubkey}`);
      }
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_prediction_claim
// ---------------------------------------------------------------------------

server.tool(
  "jupiter_prediction_claim",
  "Claim winnings from a resolved prediction market position. Signs and submits the claim transaction.",
  {
    position_pubkey: z.string().describe("Position public key to claim (from jupiter_prediction_positions)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();
      const response = await jupiterPost(`/prediction/v1/positions/${args.position_pubkey}/claim`, {
        ownerPubkey: wallet.publicKey.toBase58(),
      });

      if (!response.transaction) {
        return ok(response);
      }

      const signature = await signAndSendJupiterTx(response.transaction);
      return ok({ signature, claimed: true });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_dca_create
// ---------------------------------------------------------------------------

server.tool(
  "jupiter_dca_create",
  "Create a Jupiter Recurring DCA order. Automated dollar-cost averaging — Jupiter keeper bots execute swaps on schedule. 0.1% fee per swap.",
  {
    input_mint: z.string().describe("Token to spend (e.g. USDC mint for buying SOL with USDC)"),
    output_mint: z.string().describe("Token to receive (e.g. SOL mint)"),
    total_amount: z.number().positive().describe("Total amount to DCA (in input token's human-readable units, e.g. 100 for 100 USDC)"),
    input_decimals: z.number().int().min(0).max(18).describe("Decimals of the input token (6 for USDC, 9 for SOL)"),
    number_of_orders: z.number().int().min(2).describe("Number of DCA cycles (total_amount split evenly)"),
    interval_seconds: z.number().int().positive().describe("Seconds between each cycle (86400 = daily, 3600 = hourly)"),
    min_price: z.number().positive().optional().describe("Only execute if price is above this (optional)"),
    max_price: z.number().positive().optional().describe("Only execute if price is below this (optional)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();
      // Convert human-readable amount to raw amount
      const rawAmount = Math.round(args.total_amount * Math.pow(10, args.input_decimals));

      const response = await jupiterPost("/recurring/v1/createOrder", {
        user: wallet.publicKey.toBase58(),
        inputMint: args.input_mint,
        outputMint: args.output_mint,
        params: {
          time: {
            inAmount: rawAmount,
            numberOfOrders: args.number_of_orders,
            interval: args.interval_seconds,
            minPrice: args.min_price ?? null,
            maxPrice: args.max_price ?? null,
            startAt: null, // start immediately
          },
        },
      });

      if (!response.transaction) {
        return ok(response);
      }

      // DCA supports Jupiter's /execute endpoint
      const tx = VersionedTransaction.deserialize(Buffer.from(response.transaction, "base64"));
      tx.sign([wallet]);
      const signedBase64 = Buffer.from(tx.serialize()).toString("base64");

      const executeResult = await jupiterPost("/recurring/v1/execute", {
        signedTransaction: signedBase64,
        requestId: response.requestId,
      });

      return ok({
        ...executeResult,
        requestId: response.requestId,
        note: `DCA order created: ${args.total_amount} ${args.input_mint} split into ${args.number_of_orders} orders, every ${args.interval_seconds}s. Jupiter keepers will auto-execute.`,
      });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_dca_list
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "jupiter_dca_list",
  "List your active or historical Jupiter DCA orders.",
  {
    status: z.enum(["active", "history"]).optional().describe("Filter by status (default: active)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();
      const status = args.status ?? "active";
      const result = await jupiterGet(`/recurring/v1/getRecurringOrders?user=${wallet.publicKey.toBase58()}&orderStatus=${status}&recurringType=time`);
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: jupiter_dca_cancel
// ---------------------------------------------------------------------------

server.tool(
  "jupiter_dca_cancel",
  "Cancel an active Jupiter DCA order. Returns remaining funds to your wallet.",
  {
    order: z.string().describe("Order public key to cancel (from jupiter_dca_list)"),
  },
  async (args) => {
    try {
      const wallet = getWallet();

      const response = await jupiterPost("/recurring/v1/cancelOrder", {
        order: args.order,
        user: wallet.publicKey.toBase58(),
        recurringType: "time",
      });

      if (!response.transaction) {
        return ok(response);
      }

      const tx = VersionedTransaction.deserialize(Buffer.from(response.transaction, "base64"));
      tx.sign([wallet]);
      const signedBase64 = Buffer.from(tx.serialize()).toString("base64");

      const executeResult = await jupiterPost("/recurring/v1/execute", {
        signedTransaction: signedBase64,
        requestId: response.requestId,
      });

      return ok({ ...executeResult, cancelled: true });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ===========================================================================
// PERCOLATOR PERPETUAL FUTURES TOOLS (9 tools)
// ===========================================================================

const percolator = new PercolatorAdapter();

// ---------------------------------------------------------------------------
// Tool: percolator_create_market
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "percolator_create_market",
  "Create a new Percolator perpetual futures market. Agent becomes admin/oracle authority. Returns slab address for all subsequent operations.",
  {
    collateral_mint: z.string().describe("Collateral token mint address (e.g. BONK, wSOL)"),
    initial_price_e6: z.string().describe("Initial oracle price in e6 format (1 USD = 1000000). Example: '150000' for $0.15"),
    lp_collateral: z.string().describe("Initial LP collateral in native token units (e.g. '1000000000' for 1B BONK lamports)"),
    tier: z.enum(["small", "medium", "large"]).optional().describe("Slab tier: small (256 slots, ~0.44 SOL), medium (1024, ~1.73 SOL), large (4096, ~6.91 SOL). Default: small"),
    network: z.enum(["devnet", "mainnet"]).optional().describe("Network (default: devnet)"),
  },
  async (args) => {
    try {
      const result = await percolator.createMarket({
        collateralMint: args.collateral_mint,
        initialPriceE6: BigInt(args.initial_price_e6),
        lpCollateral: BigInt(args.lp_collateral),
        tier: args.tier as any,
        network: args.network as any,
      });
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_trade
// ---------------------------------------------------------------------------

server.tool(
  "percolator_trade",
  "Open, close, or modify a perpetual futures position on a Percolator market. Positive size = long, negative = short. Size is in i128 native token units.",
  {
    slab: z.string().describe("Slab (market) address"),
    user_idx: z.number().int().min(0).describe("Your user account index in the slab"),
    lp_idx: z.number().int().min(0).describe("LP account index to trade against"),
    size: z.string().describe("Trade size as i128 string. Positive = go long, negative = go short. Use '0' won't work — to close, use opposite size."),
    network: z.enum(["devnet", "mainnet"]).optional().describe("Network (default: devnet)"),
  },
  async (args) => {
    try {
      const sig = await percolator.trade({
        slabAddress: args.slab,
        userIdx: args.user_idx,
        lpIdx: args.lp_idx,
        size: BigInt(args.size),
        network: args.network as any,
      });
      return ok({ signature: sig });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_deposit
// ---------------------------------------------------------------------------

server.tool(
  "percolator_deposit",
  "Deposit collateral into a Percolator market account (user or LP).",
  {
    slab: z.string().describe("Slab (market) address"),
    user_idx: z.number().int().min(0).describe("Account index to deposit into"),
    amount: z.string().describe("Amount in native token units"),
    network: z.enum(["devnet", "mainnet"]).optional(),
  },
  async (args) => {
    try {
      const sig = await percolator.deposit(args.slab, args.user_idx, BigInt(args.amount), args.network as any);
      return ok({ signature: sig });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_withdraw
// ---------------------------------------------------------------------------

server.tool(
  "percolator_withdraw",
  "Withdraw collateral from a Percolator market account. Only available when position is flat or has sufficient margin.",
  {
    slab: z.string().describe("Slab (market) address"),
    user_idx: z.number().int().min(0).describe("Account index to withdraw from"),
    amount: z.string().describe("Amount in native token units"),
    network: z.enum(["devnet", "mainnet"]).optional(),
  },
  async (args) => {
    try {
      const sig = await percolator.withdraw(args.slab, args.user_idx, BigInt(args.amount), args.network as any);
      return ok({ signature: sig });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_market_state
// ---------------------------------------------------------------------------

server.tool(
  "percolator_market_state",
  "Read the full state of a Percolator perpetual futures market: header, config, engine, risk params, and all accounts.",
  {
    slab: z.string().describe("Slab (market) address"),
  },
  async (args) => {
    try {
      const state = await percolator.getMarketState(args.slab);
      // Serialize BigInt values for JSON output
      return ok(JSON.parse(JSON.stringify(state, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )));
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_list_markets
// ---------------------------------------------------------------------------

server.tool(
  "percolator_list_markets",
  "Discover all Percolator perpetual futures markets on-chain across all program tiers.",
  {
    network: z.enum(["devnet", "mainnet"]).optional().describe("Network (default: devnet)"),
  },
  async (args) => {
    try {
      const markets = await percolator.discoverMarkets(args.network as any);
      return ok(JSON.parse(JSON.stringify(markets.map(m => ({
        slab: m.slabAddress.toBase58(),
        program: m.programId.toBase58(),
        admin: m.header.admin.toBase58(),
        collateralMint: m.config.collateralMint.toBase58(),
        oraclePrice: m.config.authorityPriceE6.toString(),
        vault: m.engine.vault.toString(),
        totalOI: m.engine.totalOpenInterest.toString(),
        numAccounts: m.engine.numUsedAccounts,
        maxLeverage: Number(10000n / (m.params.initialMarginBps || 1n)),
        tradingFeeBps: m.params.tradingFeeBps.toString(),
        paused: m.header.paused,
        resolved: m.header.resolved,
      })), (_key, value) => typeof value === "bigint" ? value.toString() : value)));
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_push_price
// ---------------------------------------------------------------------------

server.tool(
  "percolator_push_price",
  "Push a new oracle price to a Percolator market (admin/oracle authority only). Price in e6 format.",
  {
    slab: z.string().describe("Slab (market) address"),
    price_e6: z.string().describe("Oracle price in e6 format (1 USD = 1000000)"),
    network: z.enum(["devnet", "mainnet"]).optional(),
  },
  async (args) => {
    try {
      const sig = await percolator.pushOraclePrice(args.slab, BigInt(args.price_e6), args.network as any);
      return ok({ signature: sig });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_crank
// ---------------------------------------------------------------------------

server.tool(
  "percolator_crank",
  "Run the permissionless keeper crank on a Percolator market. Updates funding rates and processes maintenance.",
  {
    slab: z.string().describe("Slab (market) address"),
    network: z.enum(["devnet", "mainnet"]).optional(),
  },
  async (args) => {
    try {
      const sig = await percolator.crank(args.slab, args.network as any);
      return ok({ signature: sig });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: percolator_insurance_lp
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "percolator_insurance_lp",
  "Manage Percolator insurance fund: create mint, deposit, or withdraw insurance LP tokens.",
  {
    slab: z.string().describe("Slab (market) address"),
    action: z.enum(["create_mint", "deposit", "withdraw"]).describe("Action: create_mint (one-time), deposit, or withdraw"),
    amount: z.string().optional().describe("Amount in native units (required for deposit/withdraw)"),
    network: z.enum(["devnet", "mainnet"]).optional(),
  },
  async (args) => {
    try {
      let sig: string;
      switch (args.action) {
        case "create_mint":
          sig = await percolator.createInsuranceMint(args.slab, args.network as any);
          break;
        case "deposit":
          if (!args.amount) return err("amount is required for deposit");
          sig = await percolator.depositInsuranceLP(args.slab, BigInt(args.amount), args.network as any);
          break;
        case "withdraw":
          if (!args.amount) return err("amount is required for withdraw");
          sig = await percolator.withdrawInsuranceLP(args.slab, BigInt(args.amount), args.network as any);
          break;
      }
      return ok({ signature: sig });
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  // Register all 18 DEX adapters from the outsmart library
  await registerAllAdapters();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol messages)
  console.error("outsmart-agent MCP server started (stdio transport)");
}

main().catch((e) => {
  console.error("Fatal error starting MCP server:", e);
  process.exit(1);
});

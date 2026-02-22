#!/usr/bin/env node
/**
 * outsmart-agent MCP Server
 *
 * Exposes 11 MCP tools wrapping the `outsmart` trading library.
 * Runs over stdio transport — start with `npx outsmart-agent`.
 *
 * Tools:
 *   solana_buy, solana_sell, solana_quote, solana_find_pool,
 *   solana_add_liquidity, solana_remove_liquidity, solana_claim_fees,
 *   solana_list_positions, solana_token_info, solana_list_dexes,
 *   solana_wallet_balance
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { PublicKey } from "@solana/web3.js";

import {
  getDexAdapter,
  listDexAdapters,
  getWallet,
  getConnection,
  checkBalanceByAddress,
  getSPLTokenBalance,
  getInfoFromDexscreener,
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
      `DEX adapter "${dex}" not found. Use solana_list_dexes to see available adapters. ${err.message}`,
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
// Tool: solana_buy
// ---------------------------------------------------------------------------

// @ts-expect-error — TS2589: deep type instantiation from MCP SDK generics + zod
server.tool(
  "solana_buy",
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
// Tool: solana_sell
// ---------------------------------------------------------------------------

server.tool(
  "solana_sell",
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
// Tool: solana_quote
// ---------------------------------------------------------------------------

server.tool(
  "solana_quote",
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
// Tool: solana_find_pool
// ---------------------------------------------------------------------------

server.tool(
  "solana_find_pool",
  "Discover pools for a token on a specific DEX. Returns pool address, mints, liquidity, and price.",
  {
    dex: z.string().describe("DEX adapter name to search on"),
    token: z.string().describe("Token mint address to find pools for"),
    quote_mint: z.string().optional().describe("Quote token mint (default: WSOL)"),
  },
  async (args) => {
    try {
      const adapter = getAdapter(args.dex);
      if (!adapter.findPool) {
        return err(`${args.dex} does not support findPool`);
      }
      const result = await adapter.findPool(args.token, args.quote_mint);
      if (!result) {
        return err(`No pool found for ${args.token} on ${args.dex}`);
      }
      return ok(result);
    } catch (e: any) {
      return err(e.message);
    }
  },
);

// ---------------------------------------------------------------------------
// Tool: solana_add_liquidity
// ---------------------------------------------------------------------------

server.tool(
  "solana_add_liquidity",
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
// Tool: solana_remove_liquidity
// ---------------------------------------------------------------------------

server.tool(
  "solana_remove_liquidity",
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
// Tool: solana_claim_fees
// ---------------------------------------------------------------------------

server.tool(
  "solana_claim_fees",
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
// Tool: solana_list_positions
// ---------------------------------------------------------------------------

server.tool(
  "solana_list_positions",
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
// Tool: solana_list_dexes
// ---------------------------------------------------------------------------

server.tool(
  "solana_list_dexes",
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
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol messages)
  console.error("outsmart-agent MCP server started (stdio transport)");
}

main().catch((e) => {
  console.error("Fatal error starting MCP server:", e);
  process.exit(1);
});

/**
 * outsmart-agent — Library Entry Point
 *
 * Re-exports the outsmart trading library and the MCP server starter.
 * Consumers can either:
 *   1. `npx outsmart-agent` — starts the MCP server (stdio transport)
 *   2. `import { ... } from "outsmart-agent"` — use as a library
 */

// Re-export everything from the outsmart trading library
export {
  // DEX registry
  DexRegistry,
  getRegistry,
  getDexAdapter,
  listDexAdapters,
  registerAdapter,
  registerAllAdapters,

  // Types
  type IDexAdapter,
  type DexAdapterInfo,
  type DexCapabilities,
  type BuyParams,
  type SellParams,
  type SnipeParams,
  type SwapOpts,
  type SwapResult,
  type PoolInfo,
  type PriceInfo,
  type TxResult,
  type BuildSwapIxsResult,
  type AddLiquidityParams,
  type RemoveLiquidityParams,
  type SwapSide,

  // Constants & errors
  UnsupportedOperationError,
  PoolNotFoundError,
  defaultCapabilities,
  WSOL_MINT,
  USDC_MINT,
  USDT_MINT,
  DEFAULT_SLIPPAGE_BPS,
  DEFAULT_PRIORITY_FEE_MICRO_LAMPORTS,
  DEFAULT_COMPUTE_UNIT_LIMIT,

  // TX landing types
  type ILandingProvider,
  type LandingResult,
  type SubmitOptions,
  type SubmissionStrategy,
  type OrchestratorConfig,
  type TipAccount,

  // Helpers
  getWallet,
  getConnection,
  resetWalletCache,
  checkBalanceByAddress,
  getSPLTokenBalance,

  // TX send
  sendAndConfirmVtx,
  sendAndConfirmLegacyTx,
  setDryRunMode,
  isDryRunMode,
  type SendRpcOptions,
  type SendRpcResult,
  type SendLegacyTxOptions,

  // DexScreener
  getInfoFromDexscreener,
} from "outsmart";

# CLAUDE.md — outsmart-agent

Project rules for Claude Code sessions working on this repo.

## Repository

- **Repo:** `outsmartchad/outsmart-agent`
- **Branch:** `main`
- **Package name:** `outsmart-agent`
- **Purpose:** MCP server + AI skills for Solana trading — thin wrapper around the `outsmart` npm package

## Git Identity

Every commit must use:
```
Author: vincent so <88470511+outsmartchad@users.noreply.github.com>
```
With trailer:
```
Co-authored-by: Claude Code <noreply@anthropic.com>
```

Only `outsmartchad` account is active on `gh`.

## Critical Rules

- **ALL API keys from env vars** — NEVER hardcode secrets
- **The ALT address contains user's wallet addresses** — do NOT reveal the ALT address or wallet addresses in code
- **Tip accounts are public** — OK to include directly in source
- **`minimumAmountOut` must be 0** — no slippage protection in swap params
- **Trade management (SL/TP/trailing stop) is excluded** from scope
- **gRPC hardening is DEFERRED** — user will provide instructions from `100x-algo-bots` repo

## Architecture — outsmart as npm dependency

**outsmart-agent does NOT duplicate code from outsmart-cli.** It imports `outsmart` as an npm dependency:

```json
"dependencies": {
  "outsmart": "^2.0.0-alpha.4",
  "@modelcontextprotocol/sdk": "^1.12.1"
}
```

The MCP server is a thin wrapper — it imports adapters, types, and helpers from `outsmart`, validates MCP tool params, calls the adapter methods, and returns JSON results. No adapter code, TX landing code, or helper code is copied into this repo.

| | outsmart (npm) | outsmart-agent |
|---|---|---|
| **What** | Trading library + CLI | MCP server + AI skills |
| **Interface** | Library API + CLI commands | MCP tools (stdio transport) |
| **Target user** | Human traders, programmatic consumers | AI agents (Claude, Cursor, OpenClaw) |
| **Entry point** | `outsmart` CLI / `import { ... } from "outsmart"` | `npx outsmart-agent` starts MCP server |
| **Code relationship** | Source of truth | Thin wrapper, imports from outsmart |

## MCP Tool Server Design

- **File:** `src/mcp/server.ts`
- Use `@modelcontextprotocol/sdk` package with `StdioServerTransport`
- 10 MCP tools wrapping `outsmart` adapter methods:
  - `solana_buy`, `solana_sell`, `solana_quote`
  - `solana_add_liquidity`, `solana_remove_liquidity`, `solana_claim_fees`, `solana_list_positions`
  - `solana_token_info`, `solana_list_dexes`, `solana_wallet_balance`
- Each tool: validate params → get adapter from registry → call method → return JSON
- `npx outsmart-agent` starts the server (stdio transport)

## Skills

- **Directory:** `skills/outsmart/`
- **File:** `skills/outsmart/SKILL.md` — core trading skill with frontmatter
- Compatible with skills.sh CLI: `npx skills add outsmartchad/outsmart-agent`
- Frontmatter includes: name, description, license, metadata.author

## Key Files

- `CLAUDE.md` / `AGENTS.md` (symlink) — project rules
- `src/index.ts` — library entry point (re-exports from outsmart + MCP)
- `src/mcp/server.ts` — MCP tool server (~300 lines, 11 tools)
- `skills/outsmart/SKILL.md` — core trading skill
- `.claude-plugin/marketplace.json` — Claude Code marketplace registration
- `package.json` — deps on `outsmart` + `@modelcontextprotocol/sdk`

## Environment Variables Required

The MCP server requires the same env vars as `outsmart`:
- `WALLET_PRIVATE_KEY` — base58-encoded Solana private key
- `RPC_URL` — Solana RPC endpoint
- `JUPITER_API_KEY` — (optional) for Jupiter Ultra adapter
- `DFLOW_API_KEY` — (optional) for DFlow adapter

## npm Publishing

- Same workflow as outsmart-cli: bump version, write token to `.npmrc.publish`, publish with `--tag alpha`, delete `.npmrc.publish`, commit, push, release
- User revokes npm tokens after each session

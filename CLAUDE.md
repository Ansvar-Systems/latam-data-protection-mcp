# CLAUDE.md — latam-data-protection-mcp

LATAM Data Protection MCP server providing data protection legislation from 7 Latin American jurisdictions via Model Context Protocol.

## Quick Reference

| Task | Command |
|------|---------|
| Build database | `npm run build:db` |
| Run dev server | `npm run dev` |
| Run tests | `npm test` |
| Lint | `npm run lint` |
| Full validate | `npm run validate` |
| Ingest data | `npm run ingest` |
| Check freshness | `npm run check-updates` |

## Countries Covered

| Code | Country | Law | DPA |
|------|---------|-----|-----|
| BR | Brazil | LGPD (Lei 13.709/2018) | ANPD |
| AR | Argentina | LPDP (Law 25.326) | AAIP |
| CO | Colombia | Law 1581/2012 | SIC |
| CL | Chile | Law 19.628 | CPLT |
| UY | Uruguay | Law 18.331 | URCDP |
| MX | Mexico | LFPDPPP | INAI |
| CR | Costa Rica | Law 8968 | PRODHAB |

## Architecture

- **Database:** SQLite via `@ansvar/mcp-sqlite` (read-only at runtime)
- **Transport:** stdio (npm) + Streamable HTTP (Vercel)
- **Tools:** 10 (7 domain + 3 meta)
- **FTS:** SQLite FTS5 for full-text search across provisions

## Branching

```
feature-branch -> PR to dev -> verify on dev -> PR to main -> deploy
```

Never push directly to `main`. All changes go through `dev` first.

## Adding Data

1. Add/update seed JSON files in `data/seed/`
2. Run `npm run build:db` to rebuild the database
3. Run `npm test` to verify integrity
4. Update COVERAGE.md with new counts

## Standards

- Follow the [MCP Golden Standard](https://github.com/Ansvar-Systems/Ansvar-Architecture-Documentation/blob/main/docs/guides/mcp-golden-standard.md)
- Every tool response must include `_meta` with disclaimer and data_age
- All output must comply with ADR-009 Anti-Slop Standard

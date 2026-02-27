# LATAM Data Protection MCP

[![CI](https://github.com/Ansvar-Systems/latam-data-protection-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/latam-data-protection-mcp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@anthropic-ai/latam-data-protection-mcp)](https://www.npmjs.com/package/@anthropic-ai/latam-data-protection-mcp)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/Ansvar-Systems/latam-data-protection-mcp/badge)](https://scorecard.dev/viewer/?uri=github.com/Ansvar-Systems/latam-data-protection-mcp)

MCP server for data protection and privacy laws across 7 Latin American jurisdictions. Part of the [Ansvar MCP Network](https://github.com/Ansvar-Systems).

## Coverage

| Country | Law | Authority | Status |
|---------|-----|-----------|--------|
| Brazil | LGPD (Lei 13.709/2018) | ANPD | Pending |
| Argentina | LPDP (Law 25.326) | AAIP | Pending |
| Colombia | Law 1581/2012 | SIC | Pending |
| Chile | Law 19.628 | CPLT | Pending |
| Uruguay | Law 18.331 | URCDP | Pending |
| Mexico | LFPDPPP | INAI | Pending |
| Costa Rica | Law 8968 | PRODHAB | Pending |

See [COVERAGE.md](COVERAGE.md) for full details and known gaps.

## Quick Start

### stdio (local)

```bash
npx @anthropic-ai/latam-data-protection-mcp
```

### Claude Desktop

```json
{
  "mcpServers": {
    "latam-data-protection": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/latam-data-protection-mcp"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `search_provisions` | Full-text search across all 7 jurisdictions |
| `get_provision` | Retrieve a single article by country and reference |
| `compare_requirements` | Cross-jurisdictional comparison on a topic |
| `get_data_subject_rights` | Rights recognized per jurisdiction |
| `get_breach_notification_rules` | Notification timelines and thresholds |
| `get_cross_border_transfer_rules` | Transfer mechanisms and adequacy |
| `get_dpa_info` | Data protection authority details |
| `list_sources` | Available data sources |
| `about` | Server metadata and statistics |
| `check_data_freshness` | Source freshness evaluation |

See [TOOLS.md](TOOLS.md) for full parameter and return documentation.

## Data Sources

All legislative texts are sourced from official government publications. See [sources.yml](sources.yml) for provenance details.

## Disclaimer

This tool is for research and reference purposes only. It does NOT constitute legal advice. Always verify against official publications before making compliance decisions. See [DISCLAIMER.md](DISCLAIMER.md).

## License

Apache-2.0. See [LICENSE](LICENSE).

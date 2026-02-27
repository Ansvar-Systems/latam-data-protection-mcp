# Tools

## search_provisions

Search data protection provisions across all 7 LATAM jurisdictions using full-text search.

**Parameters:**
- `query` (string, required) — Search query. Supports FTS5 phrase and boolean terms.
- `country` (string) — ISO 3166-1 alpha-2 country code filter (BR, AR, CO, CL, UY, MX, CR).
- `topic` (string) — Topic filter (e.g., consent, breach_notification, data_subject_rights).
- `limit` (number) — Max results (1-50, default 10).

**Returns:** Array of matching provisions with snippet highlights, country, law reference, and article number.

## get_provision

Retrieve a single provision by country and article reference.

**Parameters:**
- `country` (string, required) — Country code (BR, AR, CO, CL, UY, MX, CR).
- `article` (string, required) — Article reference (e.g., "18", "7-A").

**Returns:** Full provision text, law title, article reference, and citation metadata.

## compare_requirements

Compare data protection requirements across multiple jurisdictions on a given topic.

**Parameters:**
- `countries` (string[], required) — Array of country codes to compare.
- `topic` (string, required) — Topic to compare (e.g., consent, breach_notification, cross_border_transfer).

**Returns:** Per-country comparison table with requirement summary, legal basis, and key differences.

## get_data_subject_rights

Get the data subject rights recognized in a specific jurisdiction.

**Parameters:**
- `country` (string, required) — Country code.

**Returns:** Array of rights (access, rectification, deletion, portability, etc.) with legal basis and exceptions.

## get_breach_notification_rules

Get breach notification requirements for a jurisdiction.

**Parameters:**
- `country` (string, required) — Country code.

**Returns:** Notification timeline, authority to notify, threshold for notification, data subject notification requirements, and penalties.

## get_cross_border_transfer_rules

Get cross-border data transfer rules for a jurisdiction.

**Parameters:**
- `country` (string, required) — Country code.

**Returns:** Adequacy mechanisms, transfer mechanisms (SCCs equivalents, BCRs), restrictions, and notes.

## get_dpa_info

Get information about the data protection authority in a jurisdiction.

**Parameters:**
- `country` (string, required) — Country code.

**Returns:** Authority name, full name, website, enforcement powers, and contact.

## list_sources

List all available data sources in the database.

**Parameters:** None required.

**Returns:** Array of sources with ID, name, authority, jurisdiction, item count, and last update.

## about

Return server metadata and corpus statistics.

**Parameters:**
- `include_sources` (boolean) — Include per-source metadata.

**Returns:** Server name, version, description, total provisions, country count, and data freshness.

## check_data_freshness

Evaluate data freshness against warning and critical thresholds.

**Parameters:**
- `warn_after_days` (number) — Warning threshold in days (default 45).
- `critical_after_days` (number) — Critical threshold in days (default 120).

**Returns:** Per-source freshness report with status (ok/warning/critical) and days since last update.

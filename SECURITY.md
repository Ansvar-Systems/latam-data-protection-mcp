# Security Policy

## Reporting Vulnerabilities

Report security vulnerabilities to: security@ansvar.eu

We aim to acknowledge reports within 48 hours and provide a fix within 7 days for critical issues.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Security Measures

- Read-only SQLite database (no write operations)
- Input validation on all tool parameters
- FTS5 query sanitization to prevent injection
- No external network calls during tool execution
- Automated security scanning (CodeQL, Semgrep, Trivy, Gitleaks)

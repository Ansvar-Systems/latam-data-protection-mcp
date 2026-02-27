# Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Run `npm run validate` (lint + tests)
5. Submit a PR targeting `dev`

## Data Contributions

To add or correct legislative data:
1. Add/update seed files in `data/seed/`
2. Run `npm run build:db` to rebuild the database
3. Run tests to verify integrity

## Code Style

- TypeScript strict mode
- No `any` types
- All tool functions return typed results with `_meta` metadata

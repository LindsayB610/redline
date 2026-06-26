# Contributing

Redline is an alpha OSS package and CLI for content review workflows. It is not
stable, and its output should not be trusted without human review.

Before opening a pull request:

1. Run `npm test`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run `npm run pack:dry-run --workspace @redline/core`.
5. Confirm demos, templates, and fixtures are sanitized.
6. Keep real client packets, corpora, source snapshots, reports, generated
   outputs, local absolute paths, and credentials out of the repo.

Keep Randall Degges attribution and upstream license context in Redline docs
when changing lineage-sensitive code or messaging.

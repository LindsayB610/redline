# Redline Core

Redline Core is the package and CLI for source-backed marketing page review.
It validates client packets, summarizes source readiness, audits saved page
targets, writes report bundles, and creates local private packet templates.

This package is alpha. Do not trust its recommendations without human review.
It is designed to surface source-backed findings, not to publish edits
automatically.

## CLI

```sh
redline validate-packet --client clients/demo-redline
redline source-readiness --client clients/demo-redline
redline audit-page --html page.html --judge judge.json --id homepage --url https://example.test/
redline generate-report --input report-input.json --out reports/run
redline create-template --out ~/Documents/redline-private/clients/acme-redline
redline prepare-edit-brief --report reports/run/agent-edit-plan.json
```

Keep real client packets, source snapshots, generated reports, and local paths
outside public repos. Public fixtures should be fictional demos or empty
templates only.

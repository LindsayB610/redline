# Redline CLI

Redline can run without Redline. Use the CLI when you want to validate a
local packet, check source readiness, audit a saved page target, generate a
report bundle, or create a private workspace template.

Redline is alpha. Treat every finding as a review aid, not a trusted final
recommendation.

## Commands

```sh
redline validate-packet --client clients/demo-redline
redline source-readiness --client clients/demo-redline
redline audit-page --html page.html --judge judge.json --id homepage --url https://example.test/
redline generate-report --input report-input.json --out reports/run
redline create-template --out ~/Documents/redline-private/clients/acme-redline
redline prepare-edit-brief --report reports/run/agent-edit-plan.json
```

## Private Data

Real client packets, source snapshots, generated reports, credentials, and
machine-local paths should live outside public repos. Start from
`redline create-template`, then add private client source material in a local
workspace.

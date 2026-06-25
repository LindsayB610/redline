# Redline

Redline is an alpha, source-backed marketing review tool for local client packets.
Do not trust its output without human review. It is much narrower and less mature
than Randall Degges' original Redline project.

## Randall Degges' Redline

With gratitude: Randall Degges' MIT-licensed `rdegges/redline` is the stronger,
more complete upstream reference for crawler, report, state, and embedding design.
This TypeScript Redline is an early independent implementation for local packet
experiments and should be treated as alpha.

## Quick Start

```sh
npm ci
npm test
npm run build
node bin/redline.js --help
node bin/redline.js validate-packet --client clients/demo-redline
```

Real client packets, source snapshots, generated reports, credentials, and
machine-local paths should stay outside this public repo. Use
`redline create-template` to start a private packet in a local workspace.

## License

MIT. See [LICENSE](LICENSE).

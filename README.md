# Redline

Redline is an alpha, source-backed marketing review tool for local client packets.
Do not trust its output without human review. It is much narrower and less mature
than Randall Degges' original Redline project.

Redline is for people who want to review marketing pages, drafts, or saved site
snapshots against explicit source material instead of vibe. A packet tells
Redline what the client is allowed to say, what evidence supports those claims,
what should be avoided, and which target should be reviewed.

Real client packets, source snapshots, generated reports, credentials, and
machine-local paths should stay outside this public repo.

## Randall Degges' Redline

With gratitude: Randall Degges' MIT-licensed `rdegges/redline` is the stronger,
more complete upstream reference for crawler, report, state, and embedding design.
This TypeScript Redline is an early independent implementation for local packet
experiments and should be treated as alpha.

## Quick Start

Use the checked-in demo packet first:

```sh
npm ci
npm test
npm run build
node bin/redline.js --help
node bin/redline.js validate-packet --client clients/demo-redline
node bin/redline.js source-readiness --client clients/demo-redline
```

## Use Redline On Your Own Packet

Create a private workspace outside the repo:

```sh
mkdir -p ~/Documents/redline-private/clients
node bin/redline.js create-template \
  --out ~/Documents/redline-private/clients/acme-redline \
  --client-id acme-redline \
  --name "Acme Redline"
```

Fill the generated packet:

```text
~/Documents/redline-private/clients/acme-redline/
  client.yaml
  source-manifest.json
  canonical/
    positioning.md
    buyer-language.md
    proof-library.md
    objections.md
    content-priorities.md
  sources/
  targets/
  reports/
```

Then validate it:

```sh
node bin/redline.js validate-packet \
  --client ~/Documents/redline-private/clients/acme-redline

node bin/redline.js source-readiness \
  --client ~/Documents/redline-private/clients/acme-redline
```

When the packet is ready, audit a saved page target with a judge file:

```sh
mkdir -p ~/Documents/redline-private/clients/acme-redline/reports/homepage-review

node bin/redline.js audit-page \
  --html ~/Documents/redline-private/clients/acme-redline/targets/fixtures/homepage.html \
  --judge ~/Documents/redline-private/clients/acme-redline/targets/fixtures/homepage-judge.json \
  --id homepage \
  --url https://example.test/ \
  --out ~/Documents/redline-private/clients/acme-redline/reports/homepage-review/page-audit.md
```

Generate an editor-ready report bundle when you have structured report input:

```sh
node bin/redline.js generate-report \
  --input ~/Documents/redline-private/clients/acme-redline/reports/homepage-review/report-input.json \
  --out ~/Documents/redline-private/clients/acme-redline/reports/homepage-review
```

Prepare a Codex-ready edit brief from an agent edit plan:

```sh
node bin/redline.js prepare-edit-brief \
  --report ~/Documents/redline-private/clients/acme-redline/reports/homepage-review/agent-edit-plan.json \
  --out ~/Documents/redline-private/clients/acme-redline/reports/homepage-review/edit-brief.md
```

## What To Read Next

- [docs/redline-packet-building.md](docs/redline-packet-building.md): how to
  collect sources, write canonical modules, define audit targets, and avoid
  unsupported claims.
- [docs/redline-cli.md](docs/redline-cli.md): command reference and common
  workflows.
- [docs/private-workspaces.md](docs/private-workspaces.md): where private data
  should live and how to keep it out of public repos.
- [clients/template-redline/README.md](clients/template-redline/README.md):
  template folder guide.

## Safety Rules

- Snapshot external source material into local dated files before using it.
- Treat `source-readiness` and audit findings as review aids, not final truth.
- Do not commit real client packets, source snapshots, generated reports,
  credentials, or local machine paths.
- Keep public examples fictional or sanitized.

## License

MIT. See [LICENSE](LICENSE).

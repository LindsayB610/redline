# Redline CLI

Redline can run without Workshop. Use the CLI when you want to validate a
local packet, check source readiness, audit a saved page target, generate a
report bundle, or create a private workspace template.

Redline is alpha. Treat every finding as a review aid, not a trusted final
recommendation.

## First Run

```sh
npm ci
npm run build
node bin/redline.js --help
node bin/redline.js validate-packet --client clients/demo-redline
node bin/redline.js source-readiness --client clients/demo-redline
```

The demo packet is fictional and safe to inspect. Use it to learn the folder
shape and command output before adding real client material.

## Create A Private Packet

Create real packets outside this repo:

```sh
mkdir -p ~/Documents/redline-private/clients
node bin/redline.js create-template \
  --out ~/Documents/redline-private/clients/acme-redline \
  --client-id acme-redline \
  --name "Acme Redline"
```

Then edit:

- `client.yaml`
- `source-manifest.json`
- `canonical/*.md`
- `sources/`
- `targets/`

Run validation before auditing:

```sh
node bin/redline.js validate-packet \
  --client ~/Documents/redline-private/clients/acme-redline

node bin/redline.js source-readiness \
  --client ~/Documents/redline-private/clients/acme-redline
```

## Commands

```sh
redline validate-packet --client clients/demo-redline
redline source-readiness --client clients/demo-redline
redline audit-page --html page.html --judge judge.json --id homepage --url https://example.test/
redline generate-report --input report-input.json --out reports/run
redline create-template --out ~/Documents/redline-private/clients/acme-redline
redline prepare-edit-brief --report reports/run/agent-edit-plan.json
```

## Command Guide

`validate-packet` checks packet structure, source references, canonical modules,
and cross-client boundaries. Run it after every packet edit.

`source-readiness` summarizes whether each canonical module has enough trusted
source support for useful review.

`audit-page` reviews one saved HTML target against a judge file. Use local
fixtures or dated snapshots, not live SaaS pages as source truth.

`generate-report` turns structured report input into a report bundle under the
selected output folder.

`prepare-edit-brief` turns an agent edit plan into a compact brief that a human
or Codex session can use for revisions.

`create-template` creates a starter client packet. It does not copy private
source material and does not write outside the selected output folder.

## Expected Workflow

1. Create or copy a private packet template.
2. Add dated source snapshots.
3. Write canonical modules from those snapshots.
4. Add local audit targets and judge files.
5. Run `validate-packet`.
6. Run `source-readiness`.
7. Run `audit-page` or prepare structured report input.
8. Review findings manually before making or publishing edits.

## Private Data

Real client packets, source snapshots, generated reports, credentials, and
machine-local paths should live outside public repos. Start from
`redline create-template`, then add private client source material in a local
workspace.

# Redline Client Template

Use this folder shape for a local Redline client packet. Keep real client
folders outside the public repo unless they are sanitized demo data.

## Copy The Template

Copy this folder into a private workspace before adding real source material:

```text
~/Documents/redline-private/
  clients/
    acme-redline/
```

You can also create the same shape with:

```sh
node bin/redline.js create-template \
  --out ~/Documents/redline-private/clients/acme-redline \
  --client-id acme-redline \
  --name "Acme Redline"
```

## Required Files

- `client.yaml`
- `source-manifest.json`
- `canonical/*.md`
- `sources/`
- `targets/`
- `reports/`

## What To Fill In

`client.yaml` names the packet and declares its `clientId`.

`source-manifest.json` lists the source snapshots, canonical modules, trust
levels, freshness, and target files Redline can use.

`canonical/*.md` files are the distilled source of truth. Start with:

- `positioning.md`
- `buyer-language.md`
- `proof-library.md`
- `objections.md`
- `content-priorities.md`

`sources/` holds dated snapshots of approved or provisional source material.

`targets/` holds the saved page, draft, or snapshot being reviewed.

`reports/` holds generated output and should stay private for real clients.

## Validate Before Auditing

```sh
node bin/redline.js validate-packet \
  --client ~/Documents/redline-private/clients/acme-redline

node bin/redline.js source-readiness \
  --client ~/Documents/redline-private/clients/acme-redline
```

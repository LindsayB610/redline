# Redline Release Checklist

Redline releases publish the package and CLI from public-safe source only.

1. Confirm the public Redline repo is clean and synced with `main`.
2. Confirm `README.md`, `LICENSE`, `CONTRIBUTING.md`, and `SECURITY.md` are
   present.
3. Run `npm test`.
4. Run `npm run typecheck`.
5. Run `npm run build`.
6. Run `npm run pack:dry-run --workspace @redline/core`.
7. Inspect the dry-run payload for only public source, docs, sanitized demos,
   templates, compiled output, and license files.
8. From content-redline, run
   `npm run redline:public-clone -- --run-commands`.
9. Locally, run
   `WORKSHOP_PRIVATE_ROOT=/Users/lindsaybrunner/Documents/workshop-private npm run redline:private-workspace`.

Do not release if the repo contains private client material, local absolute
paths, credentials, or generated client deliverables.

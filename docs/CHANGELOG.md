# Changelog

All notable changes to this project will be documented in this file.

This format is based on Keep a Changelog and adheres to Semantic Versioning.

## [0.2.0] - 2025-09-11
### Added
- Governance metadata to AI instructions (version, owners, review cadence, ADR/Changelog paths).
- Monorepo tooling & governance guidance (PNPM, Turborepo, Changesets, CODEOWNERS, PR checks).
- Backend reliability patterns (idempotency, outbox, retries/circuit breaker, correlation IDs, health probes).
- API stability & evolution practices; security hardening specifics; data migrations & seeding guidance.
- Frontend UI/UX polish section (forms, a11y, theming, map UX).
- Mobile privacy/permissions/battery guidance.
- DID/VC operationalization notes (JWKS, key rotation, CI test vectors).
- DevOps release/branching strategy, GitOps deployment notes.
- Contract sync CI enforcement; idempotency/deduplication contracts.
- Developer tips for local bring-up and codegen sync.

### Changed
- Strengthened repository conventions and synchronization requirements across docs, schemas, and generated clients.

### Notes
- Follow-ups: add CI pipelines, Turborepo config, and Changesets when code packages are scaffolded.
# Architecture v1 closure

## Status

V1_SKELETON_CLOSED_FOR_DEMO

## Meaning

The Industrial Yard Intelligence / Modelo Namiki architecture v1 skeleton is closed for demo/incubator purposes.

This means the repository now has:

- architecture blueprint
- architecture diagrams
- architecture decision records
- architecture readiness check
- architecture status report
- architecture manifest
- final static gate
- runtime gate
- demo operator guide
- investor technical narrative
- Cloud Edge sync smoke
- local-first edge skeleton
- Cloud API skeleton
- web cockpit skeleton
- shared DB layer
- shared API contracts
- domain lifecycle rules
- mutation audit skeleton
- safe sync preview skeleton

## What this closure allows

This baseline is acceptable for:

- Cooper/T. Smith technical walkthrough
- school project technical review
- incubator architecture review
- investor angel technical explanation
- prototype demo
- next-phase product planning

## What this closure does not claim

This is not production-ready.

It does not claim:

- production authentication
- production authorization
- production deployment
- Postgres persistence
- real sync apply mode
- conflict resolution
- mobile capture
- production evidence storage
- advanced geospatial editing
- GPS accuracy guarantees

## Required local validation

Run:

pnpm architecture:close

This validates:

- manifest
- readiness
- status
- demo operator
- final static gate

## Required runtime validation

Start the local stack:

pnpm dev:stack:windows

Then run:

pnpm architecture:runtime

This validates:

- Cloud API health
- Edge health
- Cloud API sync status
- Edge DB projection sync export
- API smoke
- Edge smoke
- integrated sync smoke
- runtime smoke

## Recommended tag

After both gates pass and the repo is clean, use a Git tag like:

architecture-v1-demo-baseline

Suggested command:

git tag architecture-v1-demo-baseline
git push origin architecture-v1-demo-baseline

Do this only after confirming the local and runtime gates pass.
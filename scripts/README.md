# Demo smoke test

This validates the local edge demo flow from PowerShell.

Prerequisite:
Start the edge server in another terminal.

Command:
pnpm --filter @iyi/edge dev

Run:
pnpm demo:smoke

Direct run:
.\scripts\demo-smoke.ps1

Validates:
1. Edge health.
2. Demo reset.
3. Guided demo scenario.
4. Demo readiness.
5. Executive report.
6. Demo package export.
7. Current package SHA-256 verification.
8. Exported package SHA-256 verification.
9. Reset and import of exported demo package.

Output:
artifacts/demo-package-smoke.json
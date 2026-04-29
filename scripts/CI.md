# Local CI

Official local validation for Industrial Yard Intelligence.

Run full local CI:

pnpm ci:local

Run while you still have uncommitted changes:

pnpm ci:local:dirty

Run faster when dependencies are already installed:

pnpm ci:local:fast

What it checks:

1. Required commands exist.
2. Repository root is correct.
3. Dependencies install with frozen lockfile.
4. Source files are UTF-8 without BOM.
5. Runtime/build artifacts are not tracked.
6. API contracts build and tests pass.
7. Edge build and tests pass.
8. Web build passes.
9. Full typecheck passes.
10. Full test suite passes.
11. Git working tree is clean.

For demo runtime validation, start the edge server and run:

pnpm demo:smoke
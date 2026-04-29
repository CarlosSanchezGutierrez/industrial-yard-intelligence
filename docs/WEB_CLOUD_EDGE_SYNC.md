# Web Cloud Edge sync panel

The cockpit now consumes Cloud Edge sync API stubs:

GET /sync/status
POST /sync/preview
POST /sync/ingest

The panel displays:

- enabled flag
- supported package kinds
- supported conflict policies
- supported directions
- preview result for a demo package
- ingest validation result for disabled apply mode

This prepares the UI for future real edge-to-cloud package ingestion without applying data yet.
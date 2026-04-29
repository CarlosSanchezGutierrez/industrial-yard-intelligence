# Web Stockpile Create Flow

The web app can now create stockpiles through apps/api.

Flow:

1. Start apps/api.
2. Start apps/web.
3. Load Cloud API panel.
4. Fill the Create stockpile form.
5. Submit.
6. apps/api writes the stockpile into .api-data/api-db.json.
7. The Cloud API panel refreshes and shows the new stockpile count.

This is the first web-to-cloud write flow.

It does not touch apps/edge yet.
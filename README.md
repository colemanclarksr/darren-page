# Peekaboo Garage Doors website

Owner: Darren Kailey · Rockwall, TX · (972) 914-9381 · dk@peekaboodoors.com
Built by Coleman Clark.

## Files
- `index.html` — the whole site in one file (home, spring repair, opener repair, off-track, new doors, areas, about, contact). Images, styles, and script are all inside it. Open it in any browser.
- `lead-webhook.gs` — Google Apps Script that catches form submissions, logs them to a Google Sheet, and emails Darren. Setup steps are at the top of the file.

## Status: DRAFT
Yellow highlights on the page are items Darren must confirm before launch (hours, same-day policy, payment methods, warranty, after-hours, brands, offers, real reviews, About copy). The sample reviews are labeled and must be deleted. The sample form entry must be cleared.

## Go live
1. Fill the yellow items, remove the draft banner.
2. Deploy `lead-webhook.gs` from Darren's Google account and paste the Web app URL into `index.html` at `LEAD_WEBHOOK_URL`.
3. Host: GitHub Pages (Settings > Pages > Deploy from branch > main) or Netlify. Point peekaboodoors.com at it from GoDaddy DNS.

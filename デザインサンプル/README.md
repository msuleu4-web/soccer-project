# Goal Labo — Web UI Kit

Interactive prototype of the Goal Labo web application.

## Screens
1. **Home** — Header, Hero, News feed, Match list, Standings table, Footer
2. **Login** — Auth form with Google + email/password

## Components
- `Header.jsx` — Sticky nav with mobile hamburger
- `Hero.jsx` — Hero banner with CTA
- `NewsSection.jsx` — News feed with league badges
- `MatchSection.jsx` — Today's matches row list
- `StandingsSection.jsx` — Tabbed standings table
- `LoginPage.jsx` — Login / sign-up form
- `Footer.jsx` — Footer with links

## Usage
Open `index.html` in a browser. Click "ログイン" in the nav to go to the login screen.

## Design Notes
- Dark theme: `#050a14` page bg, `#101827` card bg
- Fonts: Inter (headings) + Noto Sans JP (body)
- Icons: Lucide (via CDN)
- Max content width: 896px (max-w-4xl)

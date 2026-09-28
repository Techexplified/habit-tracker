# Habit & Streak Tracker — Trello Power-Up

A visually rich, behaviorally intelligent **Habit & Streak Tracker Power-Up** for Trello cards, inspired by the architecture of [Smart Search](https://github.com/Techexplified/smart-search.git).

Turn any Trello card into an interactive daily habit tracker with streak counters, monthly calendar heatmaps, weekly cadence metrics, and personalized behavioral coaching.

---

## ✨ Features

- **🔥 Dynamic Streak Tracking**: Displays current streak count (e.g. `12 Day Streak`), glowing `ON FIRE` status badge, and quick 1-click `Marked Today (Undo?)` completion toggle.
- **📅 Interactive Habit Calendar**:
  - Full monthly view (Mon–Sun grid) with month navigation.
  - Solid blue highlighted tiles with flame 🔥 indicators for completed days.
  - Golden halo outline indicating Today.
  - Click any past or current day to toggle completion with instant recalculation.
- **📊 Habit Analytics & Insights**:
  - **Weekly Habit Maintained**: Weekly target ratio (e.g., `4 of 7 days target`), progress bar, 2-week streak indicator, and Mon–Sun cadence pills with checkmarks.
  - **Monthly Habit Maintained**: Total days logged, monthly streak counter, all-time best streak (e.g., `18 days`), and month-over-month momentum indicator (`+67% vs last mo`).
  - Collapsible header for compact card-back view.
- **🧠 Personalized Habit Insights ("Behavioral Engine")**:
  - Momentum status diagnosis.
  - **Consistency Strengths**: Praises active streaks and monthly adherence percentiles.
  - **Drop-Off Pattern Alert**: Behavioral reminders (e.g., the *'Never Miss Twice'* rule).
  - **Deep AI Coach Modal**: Provides behavioral micro-interventions like the 2-Minute Anchor and Implementation Intentions.
- **⚡ Zero-Auth Trello Storage**:
  - Stores all habit data directly on the card via `t.set('card', 'shared', 'habit_data')` and `t.get('card', 'shared', 'habit_data')`.
  - Zero API keys, zero external database, and zero logins required.
  - Includes `localStorage` fallback with full demo data when running outside Trello.

---

## 🛠 Tech Stack

- **React 19**, **Vite 6**, **Tailwind CSS 4**
- **Lucide React** for icons
- **Official Trello Power-Up SDK** (`https://p.trellocdn.com/power-up.min.js`)
- **Vercel** deployment headers with `frame-ancestors` and CSP for Trello embedding

---

## 🚀 Getting Started

### Local Development

```bash
cd habit_powerup
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view and interact with the Habit Tracker in standalone demo mode.

### Production Build

```bash
npm run build
```

This generates an optimized static bundle in `dist/` ready to be served by any static host or deployed to Vercel.

---

## 📋 Trello Power-Up Setup

1. **Deploy to Vercel**:
   ```bash
   vercel
   ```
2. **Go to Trello Power-Up Admin Portal**:
   - Navigate to [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin)
   - Click **New Power-Up**
   - Fill in:
     - **Name**: Habit & Streak Tracker
     - **Iframe connector URL**: `https://your-deployment.vercel.app/connector.html`
3. **Capabilities Enabled in `connector.html`**:
   - `card-back-section`: Embeds the interactive calendar and analytics inside card details.
   - `card-badges`: Shows `🔥 12d streak` directly on board cards.
   - `card-detail-badges`: Shows streak details inside card header.
   - `card-buttons`: Adds a "Habit Tracker" action button to the card sidebar.
   - `board-buttons`: Adds a quick-access button to the board header.

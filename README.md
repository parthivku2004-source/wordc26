# World Cup 2026 Live Fixture & Score Tracking Web App

A production-ready, highly interactive World Cup 2026 tracker built with React.js, Tailwind CSS (v4), and Framer Motion.

This website automatically fetches live tournament matches and schedules in real-time, converts all kick-off dates and times to **Indian Standard Time (IST - UTC+5:30)**, and features dynamic score tracking, real-time starting lineups with visual substitutions, group standings updates, synthesized stadium crowd cheers, and browser push notifications.

---

## 🌟 Key Features

1. **Real-Time Live Score Sync:** Automatically synchronizes and fetches live football tournament scores, fixtures, and events directly from the API.
2. **Goal Alert System:** Beautiful Framer Motion overlay alerts triggering synthesized cheers using the browser's native **Web Audio API** (independent of external audio assets) and browser push notifications.
3. **Dynamic Standings:** Instant group standings updates (Groups A-L) factoring in goals, wins, and draws as matches progress.
4. **Interactive Fixtures Filter:** Search by team name, filter by group, tournament stage, dates, or toggle "LIVE Only" and "Today Only".
5. **Match Details Panel:** Pitch lineup formation diagrams (4-3-3), head-to-head records, timeline events, and match stats.
6. **Real-Time Starting Lineups & Substitutions:** Automatically tracks and visually highlights starting lineups and substitution events (swapping players on the visual pitch) as they occur in real time.
7. **Favorites System:** Highlight and follow preferred nations, persisting selections using `localStorage`.
8. **Match Reminders & ICS:** Set notifications before matches kickoff, or export matches to calendars (`.ics`).
9. **Dark Mode First:** Premium sports theme supporting glassmorphism cards and a stadium-inspired background layout.

---

## 🛠️ Tech Stack

- **Framework:** React.js (via Vite)
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Deployment Build:** Vite optimized bundler

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 1. Installation
Clone/extract the project, open your terminal in the project directory and run:
```bash
# Install all required npm dependencies
npm install
```

### 2. Run Locally (Development Server)
Launch the local Vite server:
```bash
npm run dev
```
Once started, open the local URL in your browser (typically `http://localhost:5173/`).

### 3. Production Build
Compile and bundle the project for production:
```bash
npm run build
```
The output static files will be created in the `dist/` directory.

---

## 🌐 Deployment & Hosting Guides

This project is structured as a Single Page Application (SPA). To host this application successfully and prevent `404` errors when reloading sub-pages or custom routes, use the instructions below.

### 1. Vercel (Recommended)
Vercel automatically detects Vite applications and configures them.
- **Config File:** `vercel.json` is configured at the root to handle clean URLs and routing:
  ```json
  {
    "cleanUrls": true,
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **To Deploy:**
  1. Install Vercel CLI: `npm install -g vercel`
  2. Run the command `vercel` in your project folder and follow the prompts.
  3. Alternatively, import your GitHub repository into the Vercel Dashboard.

### 2. Netlify
Netlify deployment is configured via the root configuration file.
- **Config File:** `netlify.toml` is configured at the root:
  ```toml
  [build]
    command = "npm run build"
    publish = "dist"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- **To Deploy:**
  1. Connect your repository to Netlify via the Netlify Web Console.
  2. Set the Build command to `npm run build` and the Publish directory to `dist`.
  3. Alternatively, install the Netlify CLI and run `netlify deploy --prod`.

### 3. GitHub Pages (Automated Deployments)
We have included a GitHub Actions workflow to automatically build and deploy your application.
- **Config File:** `.github/workflows/deploy.yml` will automatically build the site and deploy to GitHub Pages on every push to the `main` or `master` branch.
- **To Setup:**
  1. Push your repository to GitHub.
  2. Navigate to your Repository Settings -> **Pages**.
  3. Under **Build and deployment**, change the Source to **GitHub Actions**.
  4. The workflow will automatically pick up the push and publish the site.

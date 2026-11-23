# Kalyan Saragadam — AI Engineer & Full Stack Developer

Personal portfolio for AI engineering, GenAI, agent workflows, and full-stack projects. Built with React 19, TypeScript, Vite 8, Tailwind CSS, Firebase, and Gemini server routes.

## Live deployments

| Host | Production URL | Status |
| --- | --- | --- |
| Vercel | https://portfolio-three-delta-j35dmdk1bg.vercel.app | Live |
| Netlify | https://joyful-pegasus-f68efd.netlify.app | Live |
| Firebase Hosting | https://elated-garden-472910-m2.web.app | Live |
| Cloudflare Pages | https://8380ea3c.saragadam-kalyan-ai-portfolio.pages.dev/ | Live |

The Vercel project alias may also resolve at https://portfolio-kalyan870s-projects.vercel.app. The primary URL above is the production alias returned by the successful deployment.

The Cloudflare Pages deployment is live. The custom domain `kalyan.ai` is not yet listed as connected.

## Architecture and deployment boundaries

```mermaid
flowchart LR
    Browser[Browser: React + TypeScript] --> Host{Static asset host}
    Host --> Vercel[Vercel]
    Host --> Netlify[Netlify]
    Host --> CF[Cloudflare Pages]
    Host --> FirebaseHost[Firebase Hosting]
    Browser --> Auth[Firebase Auth]
    Browser --> Store[Firestore: owner-scoped rules]
    Browser --> Api[HTTP API adapter]
    Vercel --> Api
    Express[Node Express server] --> Api
    Api --> Gemini[Gemini API: server-only key]
    Api --> Providers[GitHub, Substack, email providers]
    Express --> Live[Gemini Live WebSocket]
    GitHub[GitHub main] --> CI[GitHub Actions]
    CI --> Deploy[Configured host workflow]
```

The frontend is a static Vite build in `dist/`. `server.ts` provides Express HTTP routes and the Gemini Live WebSocket; `api/index.ts` adapts the HTTP routes for Vercel. Static hosting serves the UI only unless that provider has a matching serverless-function adapter configured. The Netlify redirect expects a function under `netlify/functions`; Cloudflare Pages currently has no Functions adapter in this repository. Firebase Auth and Firestore are the existing account and saved-data services; Firestore rules deny access by default and scope user records to verified owners. No relational database or upload workflow currently requires Neon or R2. Never put Gemini or provider secrets in `VITE_*` variables.

## Screenshots

Screenshots captured from the deployed app:

### Portfolio hero

![Portfolio homepage and hero](docs/screenshots/portfolio-home.png)

### About and workspace section

![About section as shown in the deployed app](docs/screenshots/about-section.png)

### Projects and architecture section

![Projects section as shown in the deployed app](docs/screenshots/projects-section.png)

## Local development

Requirements: Node.js 24.x and npm.

```bash
npm install --legacy-peer-deps
npm run dev
```

Create a local `.env` from `.env.example` to enable integrations. Do not commit local environment files or provider credentials.

## Build

```bash
npm run build
npm run preview
```

The project uses Vite 8 with esbuild 0.28. CI installs use `--legacy-peer-deps` for the current upstream peer dependency graph.

## Deployment configuration

Vercel uses `vercel.json`; Netlify uses `netlify.toml`. Cloudflare Pages can publish the same static `dist/` output with build command `npm install --legacy-peer-deps && npm run build`.

Firebase sign-in and saved bookmarks need these build-time variables on the host:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_ID`

Server integrations may need `GEMINI_API_KEY`, `RESEND_API_KEY`, or newsletter provider credentials. Keep those server-side; never use a `VITE_` prefix for private credentials.

### GitHub Actions secrets

The Netlify workflow uses `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`. It also accepts the Firebase variables above as repository secrets.

## Repository scope

AI Studio working artifacts, generated Firebase project configuration, draft rules, local environment files, dependencies, and build outputs are excluded. Configure your own Firebase project and review its security rules before enabling authenticated storage.

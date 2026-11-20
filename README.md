# Kalyan Saragadam — AI Engineer & Full Stack Developer

Personal portfolio for AI engineering, GenAI, agent workflows, and full-stack projects. Built with React 19, TypeScript, Vite 8, Tailwind CSS, Firebase, and Gemini server routes.

## Live deployments

| Host | Production URL | Status |
| --- | --- | --- |
| Vercel | https://portfolio-three-delta-j35dmdk1bg.vercel.app | Live |
| Netlify | https://joyful-pegasus-f68efd.netlify.app | Live |
| Cloudflare Pages | Pending Cloudflare authentication | Not deployed |

The Vercel project alias may also resolve at https://portfolio-kalyan870s-projects.vercel.app. The primary URL above is the production alias returned by the successful deployment.

## Architecture

```mermaid
flowchart LR
    Visitor[Visitor Browser] --> Host{Static Hosting}
    Host --> Vercel[Vercel]
    Host --> Netlify[Netlify]
    Host -. optional .-> CF[Cloudflare Pages]
    Vercel --> SPA[React + TypeScript SPA]
    Netlify --> SPA
    CF -. serves dist .-> SPA
    SPA --> Assets[Portfolio sections and bundled assets]
    SPA --> Firebase[Firebase Auth + Firestore<br/>optional build-time config]
    SPA --> API[API routes]
    API --> Gemini[Gemini API<br/>server-side key]
    API --> Providers[Contact, newsletter, social data providers]
    GitHub[GitHub main branch] --> CI[GitHub Actions]
    CI --> Netlify
    CI -. when credentials are configured .-> CF
```

The frontend is a static Vite build in `dist/`. Netlify and Vercel host the current production builds. Firebase and server-backed integrations require deployment environment variables; static hosting alone does not activate the Express API routes.

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

The Cloudflare Pages workflow uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Create the Pages project named `saragadam-kalyan-ai-portfolio` in Cloudflare before enabling that workflow. Configure any Firebase build variables as repository secrets too.

## Repository scope

AI Studio working artifacts, generated Firebase project configuration, draft rules, local environment files, dependencies, and build outputs are excluded. Configure your own Firebase project and review its security rules before enabling authenticated storage.

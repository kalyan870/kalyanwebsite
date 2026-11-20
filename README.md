# Kalyan Saragadam — AI Engineer & Full Stack Developer

A responsive portfolio built with React, TypeScript, Vite, Tailwind CSS, Firebase, and Gemini API routes.

## Local development

Requirements: Node.js 24.x and npm.

```bash
npm install --legacy-peer-deps
npm run dev
```

Create a local `.env` from `.env.example` to enable optional integrations. Never commit `.env` files or provider credentials.

## Build

```bash
npm run build
npm run preview
```

## Deployment

The static portfolio builds into `dist/` and can be deployed to Netlify or Vercel. Netlify configuration is in `netlify.toml`; Vercel configuration is in `vercel.json`.

Set `NPM_CONFIG_LEGACY_PEER_DEPS=true` for CI installs. The repository uses Node 24.x and pins esbuild 0.28 to match Vite 8.

For Firebase sign-in and saved bookmarks, add these build-time variables to the host:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_ID`

Server integrations can require `GEMINI_API_KEY`, `RESEND_API_KEY`, or newsletter provider credentials. Configure them as server-side environment variables only. Never use a `VITE_` prefix for private credentials.

Netlify production auto-deploy uses the `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` GitHub Actions secrets. Optional Vercel deployments can be connected in the Vercel dashboard.

## Security and repository scope

AI Studio working files, generated Firebase project configuration, draft rules, build outputs, dependencies, and local environment files are excluded from version control. Configure your own Firebase project and review its security rules before enabling authenticated data features.

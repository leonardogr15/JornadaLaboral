# Jornada Laboral — frontend

React 19 single-page app built with Vite for the Jornada Laboral work-shift tracker.
Setup, architecture and API documentation live in the [root README](../README.md).

```bash
npm ci
npm run dev          # dev server on http://localhost:3000
npm test             # Vitest, run once
npm run lint         # ESLint, no warnings allowed
npm run build        # production bundle in dist/; set VITE_API_URL to point at the API
```

`VITE_*` variables are inlined into the public JavaScript bundle at build time, so they must never
hold a secret.

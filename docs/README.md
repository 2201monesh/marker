# Marker Site Documentation

## Setup

```bash
npm install
npm run dev
```

### Local analytics testing

To enable Amplitude and HubSpot tracking on localhost:

```fish
set -x PUBLIC_ENABLE_LOCAL_ANALYTICS true; npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all Playwright tests |
| `npm run test:analytics` | Analytics tracking tests (Amplitude, HubSpot, cross-domain) |
| `npm run test:a11y` | Accessibility tests |
| `npm run test:forms-smoke` | Form submission smoke tests |
| `npm run test:not-found-smoke` | 404 page smoke test |
| `npm run test:broken-links` | Internal link validation |
| `npm run test:external-smoke` | External dependency smoke tests |

## Decisions

Architectural Decision Records (ADRs) are in [decisions/](./decisions/).

After completing significant work, run `/update-docs` to analyze recent changes and suggest documentation updates.

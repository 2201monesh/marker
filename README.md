# Marker Site

Marketing landing page for [Marker](https://onmarker.com).

## Tech Stack

- [Astro](https://astro.build) 6 with [React](https://react.dev) 19 for interactive components
- [Tailwind CSS](https://tailwindcss.com) v4
- [Firebase Hosting](https://firebase.google.com/docs/hosting) for deployment

## Getting Started

Requires Node >= 22.12.0.

```sh
npm install
npm run dev
```

The dev server runs at `localhost:4321`.

## Branded Assets

Dev-only branded asset pages live under `/branded-assets` when running
`npm run dev`.

- `/branded-assets` lists the available local asset pages
- `/branded-assets/business-card` contains the business card exports
- `/branded-assets/conference-postcard` contains the conference postcard exports

These routes are intentionally excluded from production builds and are not
published with the site.

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm run dev`     | Start local dev server at `localhost:4321`    |
| `npm run build`   | Build production site to `./dist/`            |
| `npm run preview` | Preview the production build locally          |

## Deployment

- **Live site**: https://onmarker.com (custom domain) / https://onmarker-site.web.app (Firebase)

Deployment is handled by GitHub Actions:

- **Push to `main`**: Builds and deploys to the live Firebase Hosting site.
- **Pull requests**: Builds and deploys to a preview channel.

Both workflows are defined in `.github/workflows/`.

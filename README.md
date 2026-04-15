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

## Demos

Interactive demo prototypes live under `/demos`. All demo pages are
password-protected with a client-side gate.

- **Current password**: `*scribble-draw!`
- **Demo index**: [onmarker.com/demos](https://onmarker.com/demos)

### Changing the demo password

1. Generate a SHA-256 hash of your new password:

   ```sh
   echo -n "your-new-password" | shasum -a 256
   ```

2. Paste the hash into `src/components/PasswordGate.tsx` (the `PASSWORD_HASH` constant).

3. Update this README with the new password.

## Deployment

- **Live site**: https://onmarker.com (custom domain) / https://onmarker-site.web.app (Firebase)

Deployment is handled by GitHub Actions:

- **Push to `main`**: Builds and deploys to the live Firebase Hosting site.
- **Pull requests**: Builds and deploys to a preview channel.

Both workflows are defined in `.github/workflows/`.

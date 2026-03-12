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

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm run dev`     | Start local dev server at `localhost:4321`    |
| `npm run build`   | Build production site to `./dist/`            |
| `npm run preview` | Preview the production build locally          |

## Deployment

Deployment is handled by GitHub Actions:

- **Push to `main`**: Builds and deploys to the live Firebase Hosting site.
- **Pull requests**: Builds and deploys to a preview channel.

Both workflows are defined in `.github/workflows/`.

# Lucid Repo

Lucid Repo is a React, Vite, TypeScript, and Capacitor dream journal. Dreamers can record dreams, visualize scenes, create short films, explore public dreams, and read their Dream Book. The interface uses a midnight-blue cinematic design with original art in `public/dream-art`.

## Run locally

Use a recent Node.js release, then install and start the web app:

```sh
npm install --legacy-peer-deps
npm run dev
```

The current Capacitor and RevenueCat dependency versions need `--legacy-peer-deps` for installation. The development server defaults to port 8080.

For a production check:

```sh
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in a local `.env` to connect your own backend. Do not put private service-role keys in Vite environment variables. The repository currently has a development fallback for its existing Supabase project.

## Design

- `design/mockups/`: the 19 page and flow concepts
- `design/dream-to-film-journey.md`: proposed story-to-image-to-film creation journey
- `public/dream-art/`: five generated image assets used for covers, decorative art, and empty states

Dream posters and film thumbnails come from each dream's saved media when available. The included art is used for the shared visual identity and for states with no dream media.

## Dream to Film Studio

The creation workspace is available at `/journal/studio/:dreamId`. New dreams, the Edit Dream page, and the story reader lead into the same Story → Scenes → Images → Motion → Film → Share flow. Scene planning can be reviewed before generating images; completed frames and clips are saved on the dream as each scene finishes. The published story keeps its original text and displays selected scene art inline.

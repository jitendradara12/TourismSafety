# Web (Next.js)

Run locally:

```bash
pnpm install
pnpm -C apps/web dev
```

Environment:

```
cp apps/web/.env.example apps/web/.env   # then edit if needed
```

Optional key for static map preview:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

If set, the Incidents page shows a "Map preview" button that opens a Mapbox Static Image with pins for current incidents; this is optional and does not affect other features.

Production build/start:

```bash
pnpm -C apps/web build
pnpm -C apps/web start
```

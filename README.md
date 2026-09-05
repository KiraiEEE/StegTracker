# StegTracker

Interactive outage tracker for Tunisia's electricity crisis (ElecRisis-26). Built with Nuxt 4 and D3.js, it displays real-time power status across all 24 governorates and their delegations on a color-coded map.

## Features

- Interactive SVG map of Tunisia with governorate and delegation boundaries
- Color-coded status indicators: On, Partial, Off, No data
- Filter by governorate or outage status
- Click a region for detailed breakdowns and delegation lists
- Internationalization (EN, FR, AR)
- Skeuomorphic-modern UI

## Tech Stack

- [Nuxt 4](https://nuxt.com) + Vue 3
- [D3.js](https://d3js.org) (geo, selection, zoom)
- [@nuxtjs/i18n](https://i18n.nuxtjs.org)
- GeoJSON boundaries for Tunisia

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
app/
├── app.vue              # Main layout & state
├── assets/
│   └── skeuo-modern.css # Design system
├── components/
│   └── MapView.vue      # D3-powered interactive map
├── locales/
│   ├── en.json
│   ├── fr.json
│   └── ar.json
public/
├── tunisia-governorates.geojson
└── tunisia-delegations.geojson
scripts/
└── fetch-geojson.mjs    # GeoJSON data fetcher
```

## License

MIT

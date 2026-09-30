# AgriN Connect frontend

React interface for the AgriN Connect farmer advisory experience.

## Scripts

```bash
npm ci
npm start       # development server on http://localhost:3000
npm test        # run tests
npm run build   # production bundle
```

Set `REACT_APP_API_URL` when the API is hosted separately. Production builds default to same-origin API routes, which is used by the included Render deployment configuration.

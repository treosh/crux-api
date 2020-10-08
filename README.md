# crux-api

> A tiny utility for Chrome UX Report API

**Features**:

- A tiny (350b) wrapper for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord)
- TypeScript support for CrUX API params
- Handles `404 (CrUX data not found)` and returns `null`
- Handles `429 (Quota exceeded)` with an automatic retry

## Usage

Install:

```bash
npm install crux-api

# or with yarn
yarn add crux-api
```

```js
import { createCruxApi } from 'crux-api'

const fetchCruxApi = createCruxApi({ key: API_KEY })

await fetchCruxApi({ url: 'https://www.github.com/' }) // fetch all dimensions
await fetchCruxApi({ url: 'https://www.github.com/', formFactor: 'DESKTOP' }) // fetch data for desktop devices
await fetchCruxApi({ url: 'https://www.github.com/', formFactor: 'PHONE', effectiveConnectionType: '3G' }) // fetch data for phones on 3G
```

## Todo

- [x] basic implementation (0.1.0)
- [ ] tests (using node-fetch) + CI
- [ ] add a helper for origin/url normalization
- [ ] docs (response, use with node, options)

## Credits

Sponsored by [Treo - Page speed monitoring made simple](https://treo.sh/).

[![](https://github.com/treosh/crux-api/workflows/CI/badge.svg)](https://github.com/treosh/crux-api/actions?workflow=CI)
[![](https://img.shields.io/npm/v/crux-api.svg)](https://npmjs.org/package/crux-api)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

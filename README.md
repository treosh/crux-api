# crux-api

> A tiny (400b) utility for Chrome UX Report API

**Features**:

- A tiny (400b) wrapper for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord)
- TypeScript support for CrUX API params and response
- Handles `404 (CrUX data not found)` and returns `null`
- Handles `429 (Quota exceeded)` with an automatic retry
- URL/Origin normalization helpers

## Usage

Install:

```bash
npm install crux-api

# or with yarn
yarn add crux-api
```

Fetch URL-level data:

```js
import { createCruxApi } from 'crux-api'
const fetchCruxApi = createCruxApi({ key: API_KEY })

await fetchCruxApi({ url: 'https://www.github.com/' }) // fetch all dimensions
await fetchCruxApi({ url: 'https://www.github.com/', formFactor: 'DESKTOP' }) // fetch data for desktop devices
await fetchCruxApi({ url: 'https://www.github.com/', formFactor: 'PHONE', effectiveConnectionType: '3G' }) // fetch data for phones on 3G
```

Fetch Origin-level data:

```js
import { createCruxApi } from 'crux-api'
const fetchCruxApi = createCruxApi({ key: API_KEY })

await fetchCruxApi({ origin: 'https://www.github.com' })
await fetchCruxApi({ origin: 'https://www.github.com', formFactor: 'TABLET', effectiveConnectionType: '4G' })
```

Normalize URL/Origin to match CrUX API index:

```js
import { normalizeUrl, normalizeOrigin } from 'crux-api'

console.log(normalizeUrl('https://github.com/search?q=crux-api')) // https://github.com/search (removes query params)
console.log(normalizeUrl('https://github.com')) // https://github.com/ (adds ending "/")
console.log(normalizeOrigin('https://github.com/')) // https://github.com (origin doesn't have an ending "/")
```

## Credits

Sponsored by [Treo - Page speed monitoring made simple](https://treo.sh/).

[![](https://github.com/treosh/crux-api/workflows/CI/badge.svg)](https://github.com/treosh/crux-api/actions?workflow=CI)
[![](https://img.shields.io/npm/v/crux-api.svg)](https://npmjs.org/package/crux-api)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

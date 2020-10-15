# crux-api

> A tiny (450b) utility that handles errors and provides types for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference).

**Motivation**: [CrUX API](https://web.dev/chrome-ux-report-api/) is a fantastic tool to get field data without installing any script.
While using this API in [Treo](https://treo.sh/), we discovered some cases that required an extra code, like error responses, not found entries, API limits, URLs normalization, and lack of TS notations.

`crux-api` makes it easy to work with CrUX API in browser and node.js by handling errors and providing TS support.

**Features**:

- A tiny (450b) wrapper for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord)
- TypeScript support for CrUX API params and response
- Handles `429 (Quota exceeded)` response with an automatic retry
- Returns `null` for `404 (CrUX data not found)` response
- URL normalization helper to match CrUX API index
- Works on a server with [`node-fetch`](https://www.npmjs.com/package/node-fetch)

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
await fetchCruxApi({ url: 'https://www.github.com/explore', formFactor: 'DESKTOP' }) // fetch data for desktop devices
await fetchCruxApi({ url: 'https://www.github.com/marketplace', formFactor: 'PHONE', effectiveConnectionType: '3G' }) // fetch data for phones on 3G
```

Fetch Origin-level data:

```js
import { createCruxApi } from 'crux-api'
const fetchCruxApi = createCruxApi({ key: API_KEY })

await fetchCruxApi({ origin: 'https://github.com' })
await fetchCruxApi({ origin: 'https://github.com', formFactor: 'TABLET', effectiveConnectionType: '4G' })
```

## Chrome UX Report API Response

Test CrUX API response with `curl`:

```bash
# get data for the URL without normalization
curl -d url='https://github.com/marketplace?type=actions' \
     -d effectiveConnectionType=4G \
     -d formFactor=PHONE \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'

# get origin data
curl -d origin='https://github.com' \
     -d formFactor=DESKTOP \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'

# empty response (404)
curl -d url='https://github.com/search' \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'
```

## API

### createCruxApi(options)

- **options.key** (required) - CrUX API key, use https://goo.gle/crux-api-key to generate a new key;
- **options.maxRetries** (optional, default: 5) - set retry limit for `429` error;
- **options.maxRetryTimeout** (optional, default: 60000) - set a timeout after `429`, `crux-api` randomize value and in combination with `maxRetries` it may get the value faster;
- **options.fetch** (optional, default: `window.fetch`) - pass a WHATWG fetch implementation for an environment where `window.fetch` does not exist.

### fetchCruxApi({ url?: string, origin?: string, formFactor?: FormFactor, effectiveConnectionType?: Connection })

- **params.url** or **params.origin** (required)
- **formFactor** (optional, default to all form factors) - `'PHONE' | 'DESKTOP' | 'TABLET'`
- **effectiveConnectionType** (optional, default to all connections) - `'4G' | '3G' | '2G' | 'slow-2G' | 'offline'`

Use in Node.js with [`node-fetch`](https://www.npmjs.com/package/node-fetch):

```js
import { createCruxApi } from 'crux-api'
import fetch from 'node-fetch'

const fetchCruxApi = createCruxApi({ key: process.env.API_KEY, fetch })
await fetchCruxApi({ url: 'https://github.com/GoogleChrome/lighthouse' })
```

### normalizeUrl(url)

Normalize a URL to match the CrUX API internal index.
It is a URL's `origin` + `pathname` ([source](https://github.com/treosh/crux-api/blob/main/src/index.js#L93)).

```js
import { normalizeUrl } from 'crux-api'

console.log(normalizeUrl('https://github.com/marketplace?type=actions')) // https://github.com/marketplace (removes search params)
console.log(normalizeUrl('https://github.com')) // https://github.com/ (adds "/" to the end)
```

## Credits

Sponsored by [Treo - Page speed monitoring made simple](https://treo.sh/).

[![](https://github.com/treosh/crux-api/workflows/CI/badge.svg)](https://github.com/treosh/crux-api/actions?workflow=CI)
[![](https://img.shields.io/npm/v/crux-api.svg)](https://npmjs.org/package/crux-api)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# crux-api

> A tiny (450b) utility that handles errors and provides types for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference).

**Motivation**: [CrUX API](https://web.dev/chrome-ux-report-api/) is a fantastic tool to get field data without installing any script.
While using the API in [Treo](https://treo.sh/), we discovered cases that required an extra code, like error responses, not found entries, API limits, URLs normalization, lack of TypeScript notations. `crux-api` makes it easy to work with CrUX API in Browser and Node by handling errors and providing TypeScript support.

**Features**:

- A tiny (450b) wrapper for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord);
- TypeScript support for CrUX API params and response;
- Handles `429 (Quota exceeded)` response with an automatic retry;
- Returns `null` for `404 (CrUX data not found)` response;
- URL normalization helper to match CrUX API index;
- Works on a server with [`node-fetch`](https://www.npmjs.com/package/node-fetch).

## Usage

Install:

```bash
npm install crux-api
```

Fetch URL-level data for a various form factors and connections:

```js
import { createCruxApi } from 'crux-api'
const fetchCruxApi = createCruxApi({ key: API_KEY })

await fetchCruxApi({ url: 'https://www.github.com/' }) // fetch all dimensions
await fetchCruxApi({ url: 'https://www.github.com/explore', formFactor: 'DESKTOP' }) // fetch data for desktop devices
await fetchCruxApi({ url: 'https://www.github.com/marketplace', formFactor: 'PHONE', effectiveConnectionType: '3G' }) // fetch data for phones on 3G
```

Fetch origin-level data in Node.js using [`node-fetch`](https://www.npmjs.com/package/node-fetch):

```js
import { createCruxApi } from 'crux-api'
import nodeFetch from 'node-fetch'
const fetchCruxApi = createCruxApi({ key: process.env.API_KEY, fetch: nodeFetch })

await fetchCruxApi({ origin: 'https://github.com' })
await fetchCruxApi({ origin: 'https://github.com', formFactor: 'TABLET', effectiveConnectionType: '4G' })
```

## API

### createCruxApi(options)

Returns a `fetchCruxApi` instance.

- _options.key_ (**required**) - CrUX API key, use https://goo.gle/crux-api-key to generate a new key;
- _options.fetch_ (optional, default: `window.fetch`) - pass a [WHATWG fetch](https://github.com/whatwg/fetch) implementation for a non-browser environment;
- _options.maxRetries_ (optional, default: 5) and **options.maxRetryTimeout** (optional, default: 60000) - retry limit after `429` error and the maximum time to wait for a retry.

### fetchCruxApi(queryRecordOptions)

Fetches the API using [`queryRecord options`](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord):

- _queryRecordOptions.url_ or _queryRecordOptions.origin_ (**required**) – the main identifier for a record lookup;
- _queryRecordOptions.formFactor_ (optional, default to all form factors) - the form factor dimension: `PHONE` | `DESKTOP` | `TABLET`;
- _queryRecordOptions.effectiveConnectionType_ (optional, default to all connections) - the effective network class: `4G` | `3G` | `2G` | `slow-2G` | `offline`.

```js
import { createCruxApi } from 'crux-api'

// disable retries, throw 429 error, similar to 400 and 404
const fetchCruxApi = createCruxApi({ key: process.env.API_KEY, maxRetries: 0 })

await fetchCruxApi({
  url: 'https://github.com/GoogleChrome/lighthouse',
  formFactor: 'DESKTOP',
  effectiveConnectionType: '4G',
})
```

### normalizeUrl(url)

Normalize a URL to match the CrUX API internal index.
It is a URL's `origin` + `pathname` ([source](https://github.com/treosh/crux-api/blob/main/src/index.js#L93)).

```js
import { normalizeUrl } from 'crux-api'

console.log(normalizeUrl('https://github.com/marketplace?type=actions')) // https://github.com/marketplace (removes search params)
console.log(normalizeUrl('https://github.com')) // https://github.com/ (adds "/" to the end)
```

### Responses of CrUX API

`crux-api` only resolves `200` responses, automatically retries for `429`, and returns `null` for `404`. For `400` and `5xx` it throws an error.

Below are all known responses of [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference) for easier debugging and development.

<details>
  <summary>✅ 200: URL-level data.</summary><br>

```bash
curl -d url='https://github.com/marketplace?type=actions' \
     -d effectiveConnectionType=4G \
     -d formFactor=PHONE \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'
```

```json
{
  "record": {
    "key": {
      "formFactor": "PHONE",
      "effectiveConnectionType": "4G",
      "url": "https://github.com/marketplace"
    },
    "metrics": {
      "cumulative_layout_shift": {
        "histogram": [
          {
            "start": "0.00",
            "end": "0.10",
            "density": 0.74598930481283388
          },
          {
            "start": "0.10",
            "end": "0.25",
            "density": 0.17112299465240635
          },
          {
            "start": "0.25",
            "density": 0.082887700534759287
          }
        ],
        "percentiles": {
          "p75": "0.11"
        }
      },
      "first_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 1000,
            "density": 0.454180602006688
          },
          {
            "start": 1000,
            "end": 3000,
            "density": 0.52575250836120291
          },
          {
            "start": 3000,
            "density": 0.020066889632107024
          }
        ],
        "percentiles": {
          "p75": 1365
        }
      },
      "first_input_delay": {
        "histogram": [
          {
            "start": 0,
            "end": 100,
            "density": 0.812922614575508
          },
          {
            "start": 100,
            "end": 300,
            "density": 0.1750563486100678
          },
          {
            "start": 300,
            "density": 0.012021036814425257
          }
        ],
        "percentiles": {
          "p75": 38
        }
      },
      "largest_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 2500,
            "density": 0.95027247956403227
          },
          {
            "start": 2500,
            "end": 4000,
            "density": 0.039509536784741124
          },
          {
            "start": 4000,
            "density": 0.010217983651226175
          }
        ],
        "percentiles": {
          "p75": 1583
        }
      }
    }
  },
  "urlNormalizationDetails": {
    "originalUrl": "https://github.com/marketplace?type=actions",
    "normalizedUrl": "https://github.com/marketplace"
  }
}
```

</details>

<details>
  <summary>✅ 200: Origin-level data.</summary><br>

```bash
curl -d origin='https://github.com' \
     -d formFactor=DESKTOP \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'
```

```json
{
  "record": {
    "key": {
      "formFactor": "DESKTOP",
      "origin": "https://github.com"
    },
    "metrics": {
      "first_input_delay": {
        "histogram": [
          {
            "start": 0,
            "end": 100,
            "density": 0.99445638646905821
          },
          {
            "start": 100,
            "end": 300,
            "density": 0.004072858920692389
          },
          {
            "start": 300,
            "density": 0.0014707546102500305
          }
        ],
        "percentiles": {
          "p75": 19
        }
      },
      "largest_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 2500,
            "density": 0.88479181369088589
          },
          {
            "start": 2500,
            "end": 4000,
            "density": 0.0809809456598438
          },
          {
            "start": 4000,
            "density": 0.034227240649258875
          }
        ],
        "percentiles": {
          "p75": 1775
        }
      },
      "cumulative_layout_shift": {
        "histogram": [
          {
            "start": "0.00",
            "end": "0.10",
            "density": 0.869868589370856
          },
          {
            "start": "0.10",
            "end": "0.25",
            "density": 0.076636818234678356
          },
          {
            "start": "0.25",
            "density": 0.053494592394464843
          }
        ],
        "percentiles": {
          "p75": "0.05"
        }
      },
      "first_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 1000,
            "density": 0.46447119924457247
          },
          {
            "start": 1000,
            "end": 3000,
            "density": 0.48642587346553579
          },
          {
            "start": 3000,
            "density": 0.049102927289896459
          }
        ],
        "percentiles": {
          "p75": 1572
        }
      }
    }
  }
}
```

</details>

<details>
  <summary>🛑 400 INVALID_ARGUMENT: API key not valid. Please pass a valid API key.</summary><br>

```bash
curl -d origin='https://github.com' \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=INVALID_KEY'
```

```json
{
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.Help",
        "links": [
          {
            "description": "Google developers console",
            "url": "https://console.developers.google.com"
          }
        ]
      }
    ]
  }
}
```

</details>

<details>
  <summary>🛑 400 INVALID_ARGUMENT: Invalid value at 'form_factor'/'ect'.</summary><br>

```bash
curl -d url='https://github.com/' \
     -d formFactor=mobile  \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'
```

```json
{
  "error": {
    "code": 400,
    "message": "Invalid value at 'form_factor' (type.googleapis.com/google.chrome.uxreport.v1.FormFactor), \"mobile\"",
    "status": "INVALID_ARGUMENT",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.BadRequest",
        "fieldViolations": [
          {
            "field": "form_factor",
            "description": "Invalid value at 'form_factor' (type.googleapis.com/google.chrome.uxreport.v1.FormFactor), \"mobile\""
          }
        ]
      }
    ]
  }
}
```

</details>

<details>
  <summary>🛑 404 NOT_FOUND: chrome ux report data not found.</summary><br>

```bash
curl -d url='https://github.com/search' \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'
```

```json
{
  "error": {
    "code": 404,
    "message": "chrome ux report data not found",
    "status": "NOT_FOUND"
  }
}
```

</details>

<details>
  <summary>🛑 429 RESOURCE_EXHAUSTED: Quota exceeded limit 'Queries per 100 seconds' of service.</summary><br>

```bash
curl -d url='https://github.com/search' \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=API_KEY'
```

```json
{
  "code": 429,
  "message": "Quota exceeded for quota group 'default' and limit 'Queries per 100 seconds' of service 'chromeuxreport.googleapis.com' for consumer 'project_number:00000000000000'.",
  "status": "RESOURCE_EXHAUSTED",
  "details": [
    {
      "@type": "type.googleapis.com/google.rpc.Help",
      "links": [
        {
          "description": "Google developer console API key",
          "url": "https://console.developers.google.com/project/00000000000000/apiui/credential"
        }
      ]
    }
  ]
}
```

</details>

## Credits

Sponsored by [Treo - Page speed monitoring made simple](https://treo.sh/).

[![](https://github.com/treosh/crux-api/workflows/CI/badge.svg)](https://github.com/treosh/crux-api/actions?workflow=CI)
[![](https://img.shields.io/npm/v/crux-api.svg)](https://npmjs.org/package/crux-api)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

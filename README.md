# crux-api

> A tiny [CrUX API](https://developer.chrome.com/docs/crux/api/) wrapper that supports record & history API, handles errors, and provides types.

**Motivation**: [CrUX API](https://developer.chrome.com/docs/crux/api/) is a fantastic tool to get RUM data without installing any script.
While using the API in [Treo](https://treo.sh/), we discovered a few complex cases like API errors, rate limits, not found entries, URLs normalization, and TypeScript notations. We decided to build the `crux-api` library to make working with the CrUX API easier.

**Features**:

- A tiny (500 bytes) wrapper for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference);
- Supports both the [record](https://developer.chrome.com/docs/crux/api/) & [history](https://developer.chrome.com/docs/crux/history-api/) API;
- TypeScript notations for [options and responses](https://developer.chrome.com/docs/crux/api/#request-body);
- Isomorphic: works in a browser and node.js;
- Returns `null` for the `404 (CrUX data not found)` response;
- Automatic retry when hits the API rate limits: `429 (Quota exceeded)`;
- URL normalization helper to check the CrUX API index;

## Usage

Install:

```bash
npm install crux-api
```

**Fetch URL-level data for a various form factors and connections**:

```js
import { createQueryRecord } from 'crux-api'
const queryRecord = createQueryRecord({ key: CRUX_API_KEY })

// fetch all dimensions
const jsonRecord = await queryRecord({ url: 'https://github.com/marketplace?type=actions', formFactor: 'DESKTOP' })
```

The `jsonRecord` is `null` or an `object` with [queryRecord response body](https://developer.chrome.com/docs/crux/api/#response-body), ex:

```json
{
  "record": {
    "key": {
      "formFactor": "DESKTOP",
      "url": "https://github.com/marketplace"
    },
    "metrics": {
      "first_contentful_paint": {
        "histogram": [
          { "start": 0, "end": 1000, "density": 0.454180602006688 },
          { "start": 1000, "end": 3000, "density": 0.52575250836120291 },
          { "start": 3000, "density": 0.020066889632107024 }
        ],
        "percentiles": {
          "p75": 1365
        }
      },
      "cumulative_layout_shift": { ... },
      "first_input_delay": { ... },
      "largest_contentful_paint": { ... },
      "interaction_to_next_paint": { ... },
      "experimental_time_to_first_byte": { ... },
    }
  },
  "urlNormalizationDetails": {
    "originalUrl": "https://github.com/marketplace?type=actions",
    "normalizedUrl": "https://github.com/marketplace"
  }
}
```

**Fetch historic data for a URL**:

```js
import { createQueryRecord } from 'crux-api'
const queryRecord = createQueryHistoryRecord({ key: CRUX_API_KEY })

const jsonHistory = await queryRecord({ url: 'https://www.github.com/' }) // fetch ALL_FORM_FACTORS
```

The `jsonHistory` is `null` or an `object` with [queryRecord response body](https://developer.chrome.com/docs/crux/history-api/#response-body), ex:

```json
{
  "record": {
    "key": {
      "url": "https://github.com/"
    },
    "metrics": {
      "cumulative_layout_shift": {
        "histogramTimeseries": [
          {
            "start": "0.00",
            "end": "0.10",
            "densities": [0.716522216796875, 0.672149658203125, ..., 0.892669677734375]
          },
          {
            "start": "0.10",
            "end": "0.25",
            "densities": [0.244537353515625, 0.246917724609375, ..., 0.086090087890625]
          },
          {
            "start": "0.25",
            "densities": [0.0389404296875, 0.0809326171875, ..., 0.021240234375]
          }
        ],
        "percentilesTimeseries": {
          "p75s": ["0.10", "0.12", ..., "0.05"]
        }
      },
      "experimental_time_to_first_byte": { ... },
      "first_contentful_paint": { ... },
      "first_input_delay": { ... },
      "interaction_to_next_paint": { ... },
      "largest_contentful_paint": { ... }
    }
  }
}
```

## API

### createQueryRecord(createOptions)

Returns a `queryRecord` function.

- _createOptions.key_ (**required**) - CrUX API key, use https://goo.gle/crux-api-key to generate a new key;
- _createOptions.fetch_ (optional, default: `window.fetch`) - pass a [WHATWG fetch](https://github.com/whatwg/fetch) implementation for a non-browser environment;

#### queryRecord(queryOptions)

Fetches CrUX API using [`queryRecord options`](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord):

- _queryOptions.url_ or _queryOptions.origin_ (**required**) – the main identifier for a record lookup;
- _queryOptions.formFactor_ (optional, defaults to all form factors) - the form factor dimension: `PHONE` | `DESKTOP` | `TABLET`;
- _queryOptions.effectiveConnectionType_ (optional, defaults to all connections) - the effective network class: `4G` | `3G` | `2G` | `slow-2G` | `offline`.

Returns a Promise with a raw [`queryRecord` response](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference/rest/v1/records/queryRecord#response-body) or `null` when the data is not found.

```js
import { createQueryRecord } from 'crux-api'

const queryRecord = createQueryRecord({ key: process.env.CRUX_API_KEY })
const res = await queryRecord({
  url: 'https://github.com/marketplace?type=actions',
  formFactor: 'DESKTOP',
  effectiveConnectionType: '4G',
})

// res -> URL-level data for https://github.com/marketplace
```

### normalizeUrl(url)

Normalize a URL to match the CrUX API internal index.
It is a URL's `origin` + `pathname` ([source](./src/index.js#76)).

```js
import { normalizeUrl } from 'crux-api'

console.log(normalizeUrl('https://github.com/marketplace?type=actions')) // https://github.com/marketplace (removes search params)
console.log(normalizeUrl('https://github.com')) // https://github.com/ (adds "/" to the end)
```

### CrUX API Responses

The `crux-api` is designed to return data and automatically handles errors. It returns an object for `200` responses, retries after `429`, and returns `null` for `404`.
For `400` and `5xx` it throws a relevant error.

Below are all known responses of [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference) for easier debugging and development (The API documentation is vague about errors, [please, submit an issue](https://github.com/treosh/crux-api/issues), if you know other responses).

<details>
  <summary>✅ 200: URL-level data</summary><br>

```bash
curl -d url='https://github.com/marketplace?type=actions' \
     -d effectiveConnectionType=4G \
     -d formFactor=PHONE \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
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
  <summary>✅ 200: Origin-level data</summary><br>

```bash
curl -d origin='https://github.com' \
     -d formFactor=DESKTOP \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
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
  <summary>🛑 400 INVALID_ARGUMENT: API key not valid, please pass a valid API key</summary><br>

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
  <summary>🛑 400 INVALID_ARGUMENT: Invalid value at 'form_factor'/'ect'</summary><br>

```bash
curl -d url='https://github.com/' \
     -d formFactor=mobile  \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
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
  <summary>🛑 404 NOT_FOUND: chrome ux report data not found</summary><br>

```bash
curl -d url='https://github.com/search' \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
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
  <summary>🛑 429 RESOURCE_EXHAUSTED: Quota exceeded limit 'Queries per 100 seconds' of service</summary><br>

```bash
curl -d url='https://github.com/search' \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
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

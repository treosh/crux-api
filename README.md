# crux-api

> A tiny [CrUX API](https://developer.chrome.com/docs/crux/api/) wrapper that supports record & history API, handles errors, and provides types.

**Motivation**: [CrUX API](https://developer.chrome.com/docs/crux/api/) is a fantastic tool to get RUM data without installing any script.
While using the API in [Treo](https://treo.sh/), we discovered a few complex cases like API errors, rate limits, not found entries, URLs normalization, and TypeScript notations. We decided to build the `crux-api` library to make working with the CrUX API easier.

**Features**:

- A tiny (500 bytes) wrapper for [Chrome UX Report API](https://developers.google.com/web/tools/chrome-user-experience-report/api/reference);
- Supports both the [record](https://developer.chrome.com/docs/crux/api/) and [history](https://developer.chrome.com/docs/crux/history-api/) API;
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
    "key": { "formFactor": "DESKTOP", "url": "https://github.com/marketplace" },
    "metrics": {
      "largest_contentful_paint_image_time_to_first_byte": { "percentiles": { "p75": 838 } },
      "largest_contentful_paint_resource_type": { "fractions": { "text": 0.3544, "image": 0.6456 } },
      "first_contentful_paint": {
        "histogram": [
          { "start": 0, "end": 1800, "density": 0.9194 },
          { "start": 1800, "end": 3000, "density": 0.0576 },
          { "start": 3000, "density": 0.023 }
        ],
        "percentiles": { "p75": 1208 }
      },
      "largest_contentful_paint_image_resource_load_delay": { "percentiles": { "p75": 176 } },
      "navigation_types": {
        "fractions": {
          "back_forward_cache": 0.0398,
          "prerender": 0.0089,
          "navigate": 0.7618,
          "navigate_cache": 0,
          "reload": 0.0104,
          "restore": 0.0079,
          "back_forward": 0.1712
        }
      },
      "round_trip_time": {
        "histogram": [
          { "start": 0, "end": 75, "density": 0.4881 },
          { "start": 75, "end": 275, "density": 0.4041 },
          { "start": 275, "density": 0.1078 }
        ],
        "percentiles": { "p75": 153 }
      },
      "cumulative_layout_shift": {
        "histogram": [
          { "start": "0.00", "end": "0.10", "density": 0.9343 },
          { "start": "0.10", "end": "0.25", "density": 0.0511 },
          { "start": "0.25", "density": 0.0146 }
        ],
        "percentiles": { "p75": "0.01" }
      },
      "experimental_time_to_first_byte": {
        "histogram": [
          { "start": 0, "end": 800, "density": 0.6801 },
          { "start": 800, "end": 1800, "density": 0.2999 },
          { "start": 1800, "density": 0.02 }
        ],
        "percentiles": { "p75": 846 }
      },
      "interaction_to_next_paint": {
        "histogram": [
          { "start": 0, "end": 200, "density": 0.9682 },
          { "start": 200, "end": 500, "density": 0.023 },
          { "start": 500, "density": 0.0088 }
        ],
        "percentiles": { "p75": 63 }
      },
      "largest_contentful_paint": {
        "histogram": [
          { "start": 0, "end": 2500, "density": 0.9343 },
          { "start": 2500, "end": 4000, "density": 0.0418 },
          { "start": 4000, "density": 0.0239 }
        ],
        "percentiles": { "p75": 1450 }
      },
      "largest_contentful_paint_image_element_render_delay": { "percentiles": { "p75": 146 } },
      "largest_contentful_paint_image_resource_load_duration": { "percentiles": { "p75": 362 } }
    },
    "collectionPeriod": {
      "firstDate": { "year": 2026, "month": 1, "day": 11 },
      "lastDate": { "year": 2026, "month": 2, "day": 7 }
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
import { createQueryHistoryRecord } from 'crux-api'
const queryHistoryRecord = createQueryHistoryRecord({ key: CRUX_API_KEY })

const jsonHistory = await queryHistoryRecord({ url: 'https://github.com/' }) // fetch ALL_FORM_FACTORS
```

The `jsonHistory` is `null` or an `object` with [queryHistoryRecord response body](https://developer.chrome.com/docs/crux/history-api/#response-body), ex:

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
            "densities": [0.936, 0.9367, 0.9352, ...]
          },
          {
            "start": "0.10",
            "end": "0.25",
            "densities": [0.0599, 0.0593, 0.0609, ...]
          },
          {
            "start": "0.25",
            "densities": [0.0041, 0.0041, 0.0039, ...]
          },
          { ... }
        ],
        "percentilesTimeseries": {
          "p75s": ["0.05", "0.05", ...]
        }
      },
      "experimental_time_to_first_byte": { ... },
      "first_contentful_paint": { ... },
      "largest_contentful_paint_image_element_render_delay": { ... },
      "largest_contentful_paint_resource_type": { ... },
      "navigation_types": { ... },
      "round_trip_time": { ... },
      "form_factors": { ... },
      "interaction_to_next_paint": { ... },
      "largest_contentful_paint": { ... },
      "largest_contentful_paint_image_resource_load_delay": { ... },
      "largest_contentful_paint_image_resource_load_duration": { ... },
      "largest_contentful_paint_image_time_to_first_byte": { ... },
    },
    "collectionPeriods": [
      {
        "firstDate": { "year": 2025, "month": 7, "day": 27 },
        "lastDate": { "year": 2025, "month": 8, "day": 23 }
      },
      { ... }
    ]
  }
}
```

## API

### createQueryRecord(createOptions)

Returns a `queryRecord` function.

- _createOptions.key_ (**required**) - CrUX API key, use https://goo.gle/crux-api-key to generate a new key;
- _createOptions.fetch_ (optional, default: `window.fetch`) - pass a [WHATWG fetch](https://github.com/whatwg/fetch) implementation for a non-browser environment;

#### queryRecord(queryOptions)

Fetches CrUX API using [`queryRecord options`](https://developer.chrome.com/docs/crux/api/):

- _queryOptions.url_ or _queryOptions.origin_ (**required**) – the main identifier for a record lookup;
- _queryOptions.formFactor_ (optional, defaults to all form factors) - the form factor dimension: `PHONE` | `DESKTOP` | `TABLET`.
- _queryOptions.collectionPeriodCount_ (optional, default is 25) - the number of collection periods to return between 1 and 40

Returns a Promise with a raw [`queryRecord` response](https://developer.chrome.com/docs/crux/api/#response-body) or `null` when the data is not found.

```js
import { createQueryRecord } from 'crux-api'

const queryRecord = createQueryRecord({ key: process.env.CRUX_API_KEY })
const res = await queryRecord({
  url: 'https://github.com/marketplace?type=actions',
  formFactor: 'DESKTOP',
})

// res -> URL-level data for https://github.com/marketplace
```

### createQueryHistoryRecord(historyOptions)

Returns a function that fetches [CrUX History API using [`queryHistoryRecord options`](https://developer.chrome.com/docs/crux/history-api/#http-request):

```js
import { createQueryHistoryRecord } from 'crux-api'

const queryHistory = createQueryHistoryRecord({ key: process.env.CRUX_API_KEY })
const res = await queryHistory({ url: 'https://www.github.com/' })
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
  <summary>✅ 200: URL-level CrUX History API data</summary><br>

```bash
curl -d url='https://github.com/' \
     -d formFactor=DESKTOP \
     'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=CRUX_API_KEY'
```

```json
{
  "record": {
    "key": { "formFactor": "DESKTOP", "url": "https://github.com/" },
    "metrics": {
      "cumulative_layout_shift": {
        "histogramTimeseries": [
          {
            "start": "0.00",
            "end": "0.10",
            "densities": [
              0.9451, 0.9459, 0.9458, 0.9435, 0.9439, 0.9483, 0.9478, 0.9486, 0.9472, 0.9455, 0.9383, 0.9262, 0.8933,
              0.856, 0.8275, 0.8092, 0.8117, 0.8178, 0.8232, 0.8265, 0.8278, 0.8336, 0.8417, 0.8511, 0.8577
            ]
          },
          {
            "start": "0.10",
            "end": "0.25",
            "densities": [
              0.0515, 0.0508, 0.051, 0.0529, 0.0524, 0.0485, 0.0491, 0.048, 0.0497, 0.0509, 0.0574, 0.0683, 0.0989,
              0.1345, 0.1613, 0.179, 0.1756, 0.1696, 0.1636, 0.1602, 0.159, 0.154, 0.1461, 0.1375, 0.1313
            ]
          },
          {
            "start": "0.25",
            "densities": [
              0.0034, 0.0033, 0.0032, 0.0035, 0.0036, 0.0033, 0.0031, 0.0034, 0.0031, 0.0036, 0.0043, 0.0056, 0.0078,
              0.0096, 0.0112, 0.0118, 0.0128, 0.0125, 0.0132, 0.0133, 0.0132, 0.0124, 0.0123, 0.0114, 0.011
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            "0.05",
            "0.05",
            "0.05",
            "0.05",
            "0.05",
            "0.04",
            "0.04",
            "0.04",
            "0.04",
            "0.04",
            "0.05",
            "0.06",
            "0.07",
            "0.08",
            "0.08",
            "0.09",
            "0.08",
            "0.08",
            "0.08",
            "0.08",
            "0.08",
            "0.08",
            "0.08",
            "0.08",
            "0.08"
          ]
        }
      },
      "first_contentful_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 1800,
            "densities": [
              0.8693, 0.8688, 0.8704, 0.8652, 0.866, 0.8617, 0.8647, 0.8692, 0.8702, 0.8697, 0.8685, 0.8702, 0.8737,
              0.8726, 0.8727, 0.8725, 0.8671, 0.8653, 0.863, 0.8622, 0.8642, 0.8659, 0.8648, 0.8599, 0.8552
            ]
          },
          {
            "start": 1800,
            "end": 3000,
            "densities": [
              0.0841, 0.0841, 0.0842, 0.087, 0.088, 0.0905, 0.0896, 0.0861, 0.085, 0.0853, 0.0853, 0.0837, 0.0823,
              0.0815, 0.0818, 0.0818, 0.0852, 0.0866, 0.087, 0.087, 0.0865, 0.0857, 0.0873, 0.0895, 0.0924
            ]
          },
          {
            "start": 3000,
            "densities": [
              0.0466, 0.0471, 0.0455, 0.0478, 0.046, 0.0479, 0.0457, 0.0448, 0.0448, 0.045, 0.0462, 0.0461, 0.044,
              0.0459, 0.0455, 0.0457, 0.0477, 0.0481, 0.05, 0.0507, 0.0493, 0.0484, 0.0479, 0.0506, 0.0524
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            1340, 1341, 1342, 1360, 1364, 1366, 1359, 1337, 1328, 1324, 1325, 1324, 1315, 1310, 1306, 1297, 1313, 1327,
            1335, 1341, 1329, 1328, 1337, 1352, 1380
          ]
        }
      },
      "interaction_to_next_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 200,
            "densities": [
              0.9261, 0.9262, 0.929, 0.9341, 0.9369, 0.9378, 0.9415, 0.9408, 0.9414, 0.942, 0.9422, 0.9435, 0.9443,
              0.9463, 0.9492, 0.9509, 0.9539, 0.9549, 0.955, 0.9561, 0.9565, 0.9561, 0.9565, 0.9532, 0.9504
            ]
          },
          {
            "start": 200,
            "end": 500,
            "densities": [
              0.0536, 0.0536, 0.0518, 0.0471, 0.045, 0.0427, 0.0392, 0.0398, 0.0389, 0.0384, 0.0392, 0.039, 0.0388,
              0.0391, 0.0372, 0.0362, 0.0346, 0.0329, 0.0335, 0.0318, 0.032, 0.0321, 0.0314, 0.033, 0.0341
            ]
          },
          {
            "start": 500,
            "densities": [
              0.0203, 0.0202, 0.0193, 0.0187, 0.0182, 0.0194, 0.0193, 0.0194, 0.0196, 0.0196, 0.0186, 0.0174, 0.0168,
              0.0146, 0.0136, 0.0129, 0.0115, 0.0122, 0.0115, 0.0121, 0.0115, 0.0118, 0.0121, 0.0138, 0.0154
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [79, 78, 78, 75, 71, 69, 67, 67, 67, 67, 67, 67, 67, 67, 66, 64, 63, 63, 62, 63, 63, 63, 62, 62, 62]
        }
      },
      "largest_contentful_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 2500,
            "densities": [
              0.8137, 0.8162, 0.8207, 0.821, 0.8292, 0.8457, 0.8513, 0.8548, 0.8529, 0.8538, 0.8622, 0.8726, 0.8638,
              0.8423, 0.8222, 0.8047, 0.8033, 0.7977, 0.7969, 0.7948, 0.7952, 0.7885, 0.784, 0.7786, 0.7738
            ]
          },
          {
            "start": 2500,
            "end": 4000,
            "densities": [
              0.1206, 0.1185, 0.1154, 0.1168, 0.1094, 0.0982, 0.0947, 0.09, 0.0931, 0.0924, 0.0854, 0.078, 0.0841,
              0.0985, 0.1126, 0.1252, 0.1261, 0.1278, 0.1282, 0.1294, 0.129, 0.1317, 0.1368, 0.1391, 0.1435
            ]
          },
          {
            "start": 4000,
            "densities": [
              0.0657, 0.0653, 0.0638, 0.0621, 0.0614, 0.0561, 0.054, 0.0552, 0.054, 0.0538, 0.0524, 0.0494, 0.0521,
              0.0591, 0.0651, 0.0701, 0.0706, 0.0745, 0.0749, 0.0758, 0.0758, 0.0798, 0.0792, 0.0823, 0.0827
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            2172, 2157, 2134, 2137, 2075, 1964, 1931, 1893, 1915, 1910, 1842, 1766, 1825, 1967, 2095, 2201, 2218, 2234,
            2245, 2257, 2253, 2282, 2317, 2338, 2380
          ]
        }
      },
      "largest_contentful_paint_image_element_render_delay": {
        "percentilesTimeseries": {
          "p75s": [
            331, 323, 313, 309, 273, 253, 251, 251, 258, 263, 258, 254, 256, 265, 280, 316, 320, 322, 320, 318, 335,
            374, 385, 388, 389
          ]
        }
      },
      "largest_contentful_paint_image_resource_load_delay": {
        "percentilesTimeseries": {
          "p75s": [
            203, 189, 185, 182, 185, 187, 188, 188, 187, 178, 180, 185, 190, 207, 231, 328, 344, 357, 373, 392, 411,
            583, 592, 430, 292
          ]
        }
      },
      "largest_contentful_paint_image_resource_load_duration": {
        "percentilesTimeseries": {
          "p75s": [
            139, 142, 144, 142, 173, 176, 176, 177, 171, 176, 188, 183, 179, 172, 151, 137, 139, 142, 145, 150, 151,
            145, 142, 143, 146
          ]
        }
      },
      "navigation_types": {
        "fractionTimeseries": {
          "back_forward_cache": {
            "fractions": [
              0.0074, 0.0067, 0.0065, 0.0066, 0.0067, 0.0086, 0.0095, 0.0113, 0.0121, 0.0101, 0.0091, 0.0069, 0.0061,
              0.0062, 0.006, 0.0056, 0.0063, 0.0071, 0.0072, 0.0084, 0.0092, 0.0099, 0.0097, 0.0099, 0.0106
            ]
          },
          "prerender": {
            "fractions": [
              0.2518, 0.2512, 0.2497, 0.2488, 0.2483, 0.2486, 0.2509, 0.2532, 0.2552, 0.2575, 0.2571, 0.2577, 0.2581,
              0.2585, 0.2584, 0.2597, 0.261, 0.2618, 0.2607, 0.2571, 0.2514, 0.2497, 0.2518, 0.2554, 0.2591
            ]
          },
          "navigate": {
            "fractions": [
              0.6292, 0.6319, 0.6335, 0.6335, 0.6342, 0.6339, 0.6315, 0.6307, 0.6292, 0.6288, 0.6294, 0.6311, 0.6302,
              0.6305, 0.631, 0.6315, 0.6305, 0.6288, 0.6292, 0.6305, 0.6367, 0.6402, 0.6392, 0.6359, 0.6328
            ]
          },
          "navigate_cache": {
            "fractions": [
              0.0014, 0.0013, 0.0012, 0.0016, 0.0012, 0.0012, 0.0016, 0.0013, 0.0013, 0.0015, 0.0017, 0.0016, 0.0014,
              0.0013, 0.0014, 0.0019, 0.0013, 0.0015, 0.0018, 0.0016, 0.0019, 0.0013, 0.0016, 0.0015, 0.0014
            ]
          },
          "reload": {
            "fractions": [
              0.017, 0.0165, 0.0169, 0.0168, 0.0169, 0.0167, 0.0169, 0.0164, 0.0166, 0.0166, 0.0164, 0.016, 0.0161,
              0.0161, 0.016, 0.0155, 0.0159, 0.0164, 0.0166, 0.0171, 0.0164, 0.0164, 0.0165, 0.0164, 0.0165
            ]
          },
          "restore": {
            "fractions": [
              0.0043, 0.0038, 0.0044, 0.0045, 0.0046, 0.0042, 0.0045, 0.0042, 0.0042, 0.0044, 0.0045, 0.0039, 0.0046,
              0.0042, 0.0045, 0.0042, 0.004, 0.0041, 0.0039, 0.0038, 0.0042, 0.0036, 0.0037, 0.0041, 0.004
            ]
          },
          "back_forward": {
            "fractions": [
              0.0888, 0.0885, 0.0878, 0.0881, 0.088, 0.0868, 0.085, 0.0829, 0.0813, 0.081, 0.0816, 0.0827, 0.0835,
              0.0832, 0.0828, 0.0813, 0.081, 0.0802, 0.0804, 0.0814, 0.0802, 0.0789, 0.0774, 0.0767, 0.0756
            ]
          }
        }
      },
      "experimental_time_to_first_byte": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 800,
            "densities": [
              0.6456, 0.6462, 0.6443, 0.6345, 0.6327, 0.6346, 0.6437, 0.6608, 0.6692, 0.6764, 0.6684, 0.6564, 0.6508,
              0.6455, 0.6453, 0.6514, 0.6416, 0.6308, 0.6274, 0.6247, 0.6327, 0.6358, 0.6285, 0.6181, 0.5995
            ]
          },
          {
            "start": 800,
            "end": 1800,
            "densities": [
              0.3051, 0.3048, 0.3066, 0.3142, 0.3122, 0.3088, 0.2989, 0.2833, 0.2767, 0.2712, 0.2774, 0.2891, 0.2949,
              0.2974, 0.2941, 0.2867, 0.2921, 0.3005, 0.3038, 0.305, 0.3, 0.2968, 0.304, 0.3119, 0.3298
            ]
          },
          {
            "start": 1800,
            "densities": [
              0.0493, 0.049, 0.049, 0.0513, 0.0551, 0.0565, 0.0574, 0.0559, 0.0541, 0.0525, 0.0541, 0.0544, 0.0543,
              0.057, 0.0606, 0.0619, 0.0663, 0.0687, 0.0688, 0.0703, 0.0673, 0.0674, 0.0675, 0.07, 0.0706
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            948, 948, 951, 965, 969, 972, 964, 941, 929, 919, 928, 944, 952, 958, 959, 952, 966, 979, 985, 989, 979,
            973, 984, 997, 1022
          ]
        }
      },
      "largest_contentful_paint_image_time_to_first_byte": {
        "percentilesTimeseries": {
          "p75s": [
            1089, 1111, 1127, 1150, 1094, 1047, 1038, 1031, 1032, 1012, 1005, 1009, 1009, 1028, 1048, 1065, 1082, 1101,
            1107, 1114, 1103, 1056, 1065, 1103, 1150
          ]
        }
      },
      "largest_contentful_paint_resource_type": {
        "fractionTimeseries": {
          "image": {
            "fractions": [
              0.1295, 0.1312, 0.1352, 0.1377, 0.2061, 0.3335, 0.3686, 0.3699, 0.324, 0.3144, 0.3984, 0.5194, 0.5014,
              0.3875, 0.2758, 0.1556, 0.1529, 0.1501, 0.1482, 0.1469, 0.1462, 0.1563, 0.1572, 0.1513, 0.1471
            ]
          },
          "text": {
            "fractions": [
              0.8705, 0.8687, 0.8648, 0.8623, 0.7939, 0.6664, 0.6314, 0.6301, 0.676, 0.6855, 0.6016, 0.4806, 0.4986,
              0.6125, 0.7242, 0.8443, 0.8471, 0.8499, 0.8518, 0.853, 0.8538, 0.8437, 0.8428, 0.8486, 0.8529
            ]
          }
        }
      },
      "round_trip_time": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 75,
            "densities": [
              0.472, 0.4757, 0.4798, 0.482, 0.4855, 0.4872, 0.4922, 0.4981, 0.5012, 0.5042, 0.5014, 0.4997, 0.4982,
              0.4954, 0.4921, 0.4908, 0.4887, 0.4839, 0.4748, 0.4628, 0.4653, 0.4737, 0.4846, 0.4928, 0.496
            ]
          },
          {
            "start": 75,
            "end": 275,
            "densities": [
              0.4313, 0.4283, 0.4261, 0.4205, 0.4188, 0.4163, 0.4133, 0.4113, 0.4105, 0.4083, 0.4098, 0.4108, 0.411,
              0.4119, 0.416, 0.4167, 0.417, 0.4211, 0.4276, 0.4354, 0.4348, 0.4299, 0.42, 0.414, 0.412
            ]
          },
          {
            "start": 275,
            "densities": [
              0.0966, 0.096, 0.0941, 0.0975, 0.0957, 0.0965, 0.0946, 0.0905, 0.0883, 0.0875, 0.0888, 0.0895, 0.0908,
              0.0927, 0.0919, 0.0925, 0.0943, 0.095, 0.0976, 0.1018, 0.0999, 0.0964, 0.0954, 0.0932, 0.092
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            152, 151, 150, 150, 150, 150, 147, 144, 143, 141, 143, 143, 144, 144, 145, 145, 146, 147, 150, 155, 154,
            151, 147, 145, 144
          ]
        }
      }
    },
    "collectionPeriods": [
      { "firstDate": { "year": 2025, "month": 7, "day": 27 }, "lastDate": { "year": 2025, "month": 8, "day": 23 } },
      { "firstDate": { "year": 2025, "month": 8, "day": 3 }, "lastDate": { "year": 2025, "month": 8, "day": 30 } },
      { "firstDate": { "year": 2025, "month": 8, "day": 10 }, "lastDate": { "year": 2025, "month": 9, "day": 6 } },
      { "firstDate": { "year": 2025, "month": 8, "day": 17 }, "lastDate": { "year": 2025, "month": 9, "day": 13 } },
      { "firstDate": { "year": 2025, "month": 8, "day": 24 }, "lastDate": { "year": 2025, "month": 9, "day": 20 } },
      { "firstDate": { "year": 2025, "month": 8, "day": 31 }, "lastDate": { "year": 2025, "month": 9, "day": 27 } },
      { "firstDate": { "year": 2025, "month": 9, "day": 7 }, "lastDate": { "year": 2025, "month": 10, "day": 4 } },
      { "firstDate": { "year": 2025, "month": 9, "day": 14 }, "lastDate": { "year": 2025, "month": 10, "day": 11 } },
      { "firstDate": { "year": 2025, "month": 9, "day": 21 }, "lastDate": { "year": 2025, "month": 10, "day": 18 } },
      { "firstDate": { "year": 2025, "month": 9, "day": 28 }, "lastDate": { "year": 2025, "month": 10, "day": 25 } },
      { "firstDate": { "year": 2025, "month": 10, "day": 5 }, "lastDate": { "year": 2025, "month": 11, "day": 1 } },
      { "firstDate": { "year": 2025, "month": 10, "day": 12 }, "lastDate": { "year": 2025, "month": 11, "day": 8 } },
      { "firstDate": { "year": 2025, "month": 10, "day": 19 }, "lastDate": { "year": 2025, "month": 11, "day": 15 } },
      { "firstDate": { "year": 2025, "month": 10, "day": 26 }, "lastDate": { "year": 2025, "month": 11, "day": 22 } },
      { "firstDate": { "year": 2025, "month": 11, "day": 2 }, "lastDate": { "year": 2025, "month": 11, "day": 29 } },
      { "firstDate": { "year": 2025, "month": 11, "day": 9 }, "lastDate": { "year": 2025, "month": 12, "day": 6 } },
      { "firstDate": { "year": 2025, "month": 11, "day": 16 }, "lastDate": { "year": 2025, "month": 12, "day": 13 } },
      { "firstDate": { "year": 2025, "month": 11, "day": 23 }, "lastDate": { "year": 2025, "month": 12, "day": 20 } },
      { "firstDate": { "year": 2025, "month": 11, "day": 30 }, "lastDate": { "year": 2025, "month": 12, "day": 27 } },
      { "firstDate": { "year": 2025, "month": 12, "day": 7 }, "lastDate": { "year": 2026, "month": 1, "day": 3 } },
      { "firstDate": { "year": 2025, "month": 12, "day": 14 }, "lastDate": { "year": 2026, "month": 1, "day": 10 } },
      { "firstDate": { "year": 2025, "month": 12, "day": 21 }, "lastDate": { "year": 2026, "month": 1, "day": 17 } },
      { "firstDate": { "year": 2025, "month": 12, "day": 28 }, "lastDate": { "year": 2026, "month": 1, "day": 24 } },
      { "firstDate": { "year": 2026, "month": 1, "day": 4 }, "lastDate": { "year": 2026, "month": 1, "day": 31 } },
      { "firstDate": { "year": 2026, "month": 1, "day": 11 }, "lastDate": { "year": 2026, "month": 2, "day": 7 } }
    ]
  }
}
```

</details>

## Credits

Sponsored by [Treo - Page speed monitoring made simple](https://treo.sh/).

[![](https://github.com/treosh/crux-api/workflows/CI/badge.svg)](https://github.com/treosh/crux-api/actions?workflow=CI)
[![](https://img.shields.io/npm/v/crux-api.svg)](https://npmjs.org/package/crux-api)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

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
            "densities": [0.716522216796875, 0.672149658203125, ...]
          },
          {
            "start": "0.10",
            "end": "0.25",
            "densities": [0.244537353515625, 0.246917724609375, ...]
          },
          {
            "start": "0.25",
            "densities": [0.0389404296875, 0.0809326171875, ...]
          }
        ],
        "percentilesTimeseries": {
          "p75s": ["0.10", "0.12", ...]
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

Fetches CrUX API using [`queryRecord options`](https://developer.chrome.com/docs/crux/api/):

- _queryOptions.url_ or _queryOptions.origin_ (**required**) – the main identifier for a record lookup;
- _queryOptions.formFactor_ (optional, defaults to all form factors) - the form factor dimension: `PHONE` | `DESKTOP` | `TABLET`;
- _queryOptions.effectiveConnectionType_ (optional, defaults to all connections) - the effective network class: `4G` | `3G` | `2G` | `slow-2G` | `offline`.

Returns a Promise with a raw [`queryRecord` response](https://developer.chrome.com/docs/crux/api/#response-body) or `null` when the data is not found.

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

### createQueryHistoryRecord(historyOptions)

Returns a function that fetches [CrUX History API using [`queryHistoryRecord options`](https://developer.chrome.com/docs/crux/history-api/#http-request):

```js
import { createQueryHistoryRecord } from 'crux-api'

const queryHistory = createQueryHistoryRecord({ key: process.env.CRUX_API_KEY })
const res = await queryHistory({
  url: 'https://www.github.com/',
})
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
    "key": {
      "formFactor": "DESKTOP",
      "url": "https://github.com/"
    },
    "metrics": {
      "cumulative_layout_shift": {
        "histogramTimeseries": [
          {
            "start": "0.00",
            "end": "0.10",
            "densities": [
              0.726043701171875, 0.676971435546875, 0.638519287109375, 0.629058837890625, 0.622161865234375,
              0.656158447265625, 0.688262939453125, 0.73272705078125, 0.791351318359375, 0.845489501953125,
              0.897674560546875, 0.916046142578125, 0.91455078125, 0.91363525390625, 0.913543701171875,
              0.915008544921875, 0.9166259765625, 0.9210205078125, 0.929107666015625, 0.936553955078125,
              0.93804931640625, 0.925628662109375, 0.913299560546875, 0.9024658203125, 0.903533935546875
            ]
          },
          {
            "start": "0.10",
            "end": "0.25",
            "densities": [
              0.2373046875, 0.240753173828125, 0.224029541015625, 0.190032958984375, 0.1575927734375, 0.123931884765625,
              0.10748291015625, 0.098846435546875, 0.087677001953125, 0.07757568359375, 0.069122314453125,
              0.065460205078125, 0.064697265625, 0.06402587890625, 0.06298828125, 0.061614990234375, 0.0601806640625,
              0.05560302734375, 0.048614501953125, 0.041778564453125, 0.041229248046875, 0.05340576171875,
              0.0660400390625, 0.07568359375, 0.07342529296875
            ]
          },
          {
            "start": "0.25",
            "densities": [
              0.036651611328125, 0.082275390625, 0.137451171875, 0.180908203125, 0.220245361328125, 0.21990966796875,
              0.204254150390625, 0.168426513671875, 0.1209716796875, 0.076934814453125, 0.033203125, 0.01849365234375,
              0.020751953125, 0.0223388671875, 0.023468017578125, 0.02337646484375, 0.023193359375, 0.02337646484375,
              0.02227783203125, 0.02166748046875, 0.020721435546875, 0.020965576171875, 0.020660400390625,
              0.0218505859375, 0.023040771484375
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            "0.10",
            "0.11",
            "0.12",
            "0.14",
            "0.18",
            "0.17",
            "0.14",
            "0.10",
            "0.08",
            "0.07",
            "0.06",
            "0.06",
            "0.06",
            "0.06",
            "0.06",
            "0.06",
            "0.06",
            "0.06",
            "0.05",
            "0.05",
            "0.04",
            "0.05",
            "0.05",
            "0.05",
            "0.05"
          ]
        }
      },
      "experimental_time_to_first_byte": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 800,
            "densities": [
              0.779144287109375, 0.780303955078125, 0.777435302734375, 0.77899169921875, 0.780487060546875,
              0.779144287109375, 0.77862548828125, 0.776763916015625, 0.774810791015625, 0.76995849609375,
              0.765777587890625, 0.75335693359375, 0.741180419921875, 0.73614501953125, 0.732025146484375,
              0.7298583984375, 0.7265625, 0.72662353515625, 0.724853515625, 0.72650146484375, 0.7236328125,
              0.718994140625, 0.717437744140625, 0.71881103515625, 0.721832275390625
            ]
          },
          {
            "start": 800,
            "end": 1800,
            "densities": [
              0.1845703125, 0.184783935546875, 0.187591552734375, 0.186492919921875, 0.186920166015625,
              0.189056396484375, 0.190155029296875, 0.193328857421875, 0.1947021484375, 0.19903564453125,
              0.202911376953125, 0.21380615234375, 0.22515869140625, 0.22967529296875, 0.232208251953125,
              0.23468017578125, 0.23553466796875, 0.236907958984375, 0.237640380859375, 0.2371826171875,
              0.23992919921875, 0.24432373046875, 0.245819091796875, 0.24505615234375, 0.242095947265625
            ]
          },
          {
            "start": 1800,
            "densities": [
              0.036285400390625, 0.034912109375, 0.03497314453125, 0.034515380859375, 0.0325927734375, 0.03179931640625,
              0.031219482421875, 0.0299072265625, 0.030487060546875, 0.031005859375, 0.03131103515625, 0.0328369140625,
              0.033660888671875, 0.0341796875, 0.0357666015625, 0.03546142578125, 0.03790283203125, 0.036468505859375,
              0.037506103515625, 0.03631591796875, 0.03643798828125, 0.03668212890625, 0.0367431640625, 0.0361328125,
              0.03607177734375
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            748, 749, 752, 752, 751, 752, 755, 757, 761, 768, 778, 796, 814, 821, 826, 832, 832, 834, 836, 836, 838,
            846, 847, 846, 841
          ]
        }
      },
      "first_contentful_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 1800,
            "densities": [
              0.88543701171875, 0.88568115234375, 0.886962890625, 0.889556884765625, 0.8934326171875, 0.89837646484375,
              0.90142822265625, 0.903594970703125, 0.900787353515625, 0.899627685546875, 0.894317626953125,
              0.8936767578125, 0.89227294921875, 0.89227294921875, 0.8905029296875, 0.891815185546875, 0.88812255859375,
              0.88897705078125, 0.888946533203125, 0.888458251953125, 0.889923095703125, 0.88800048828125,
              0.88433837890625, 0.88311767578125, 0.880706787109375
            ]
          },
          {
            "start": 1800,
            "end": 3000,
            "densities": [
              0.07373046875, 0.07440185546875, 0.072662353515625, 0.0693359375, 0.0662841796875, 0.063446044921875,
              0.061248779296875, 0.06024169921875, 0.061920166015625, 0.06378173828125, 0.06536865234375,
              0.066314697265625, 0.0675048828125, 0.066741943359375, 0.06787109375, 0.0675048828125, 0.0699462890625,
              0.06915283203125, 0.068267822265625, 0.06878662109375, 0.068267822265625, 0.070343017578125,
              0.072509765625, 0.072418212890625, 0.073883056640625
            ]
          },
          {
            "start": 3000,
            "densities": [
              0.04083251953125, 0.0399169921875, 0.040374755859375, 0.041107177734375, 0.040283203125,
              0.038177490234375, 0.037322998046875, 0.036163330078125, 0.03729248046875, 0.036590576171875,
              0.040313720703125, 0.040008544921875, 0.04022216796875, 0.040985107421875, 0.0416259765625,
              0.040679931640625, 0.04193115234375, 0.0418701171875, 0.04278564453125, 0.042755126953125,
              0.04180908203125, 0.041656494140625, 0.04315185546875, 0.044464111328125, 0.04541015625
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            1221, 1216, 1219, 1205, 1186, 1173, 1158, 1157, 1165, 1175, 1190, 1204, 1214, 1217, 1222, 1227, 1231, 1237,
            1237, 1237, 1236, 1250, 1263, 1272, 1276
          ]
        }
      },
      "first_input_delay": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 100,
            "densities": [
              0.970855712890625, 0.971649169921875, 0.97064208984375, 0.969085693359375, 0.96905517578125,
              0.968017578125, 0.969146728515625, 0.96868896484375, 0.9720458984375, 0.971710205078125, 0.9720458984375,
              0.97308349609375, 0.974609375, 0.9749755859375, 0.974090576171875, 0.97412109375, 0.9752197265625,
              0.97528076171875, 0.9747314453125, 0.973236083984375, 0.973846435546875, 0.97296142578125,
              0.974884033203125, 0.97357177734375, 0.975128173828125
            ]
          },
          {
            "start": 100,
            "end": 300,
            "densities": [
              0.01763916015625, 0.01641845703125, 0.017730712890625, 0.0181884765625, 0.018218994140625,
              0.019622802734375, 0.01849365234375, 0.019256591796875, 0.0172119140625, 0.017608642578125,
              0.017059326171875, 0.016876220703125, 0.015350341796875, 0.014984130859375, 0.0159912109375,
              0.016021728515625, 0.014495849609375, 0.0145263671875, 0.014739990234375, 0.0159912109375,
              0.01568603515625, 0.016204833984375, 0.014739990234375, 0.01617431640625, 0.01416015625
            ]
          },
          {
            "start": 300,
            "densities": [
              0.011505126953125, 0.011932373046875, 0.011627197265625, 0.012725830078125, 0.012725830078125,
              0.012359619140625, 0.012359619140625, 0.012054443359375, 0.0107421875, 0.01068115234375,
              0.010894775390625, 0.010040283203125, 0.010040283203125, 0.010040283203125, 0.009918212890625,
              0.009857177734375, 0.010284423828125, 0.01019287109375, 0.010528564453125, 0.010772705078125,
              0.010467529296875, 0.010833740234375, 0.0103759765625, 0.01025390625, 0.010711669921875
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        }
      },
      "interaction_to_next_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 200,
            "densities": [
              0.9437255859375, 0.944244384765625, 0.94207763671875, 0.938720703125, 0.936737060546875,
              0.936126708984375, 0.93768310546875, 0.93988037109375, 0.94134521484375, 0.9393310546875, 0.9384765625,
              0.939208984375, 0.937744140625, 0.9365234375, 0.937286376953125, 0.937896728515625, 0.937591552734375,
              0.93682861328125, 0.9373779296875, 0.93505859375, 0.9368896484375, 0.9373779296875, 0.937255859375,
              0.938629150390625, 0.940155029296875
            ]
          },
          {
            "start": 200,
            "end": 500,
            "densities": [
              0.03204345703125, 0.032135009765625, 0.034271240234375, 0.0360107421875, 0.0382080078125, 0.0384521484375,
              0.038360595703125, 0.037994384765625, 0.036376953125, 0.037841796875, 0.038848876953125, 0.03875732421875,
              0.039947509765625, 0.04107666015625, 0.040435791015625, 0.039337158203125, 0.039947509765625,
              0.040313720703125, 0.04034423828125, 0.04168701171875, 0.0406494140625, 0.03924560546875,
              0.039581298828125, 0.039459228515625, 0.03814697265625
            ]
          },
          {
            "start": 500,
            "densities": [
              0.02423095703125, 0.02362060546875, 0.023651123046875, 0.0252685546875, 0.025054931640625,
              0.025421142578125, 0.023956298828125, 0.022125244140625, 0.02227783203125, 0.0228271484375,
              0.022674560546875, 0.02203369140625, 0.022308349609375, 0.02239990234375, 0.02227783203125,
              0.02276611328125, 0.0224609375, 0.022857666015625, 0.02227783203125, 0.02325439453125, 0.0224609375,
              0.02337646484375, 0.023162841796875, 0.02191162109375, 0.021697998046875
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [61, 62, 63, 64, 65, 66, 66, 66, 66, 67, 68, 70, 72, 73, 73, 72, 72, 73, 72, 71, 70, 70, 69, 69, 69]
        }
      },
      "largest_contentful_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 2500,
            "densities": [
              0.86895751953125, 0.850921630859375, 0.834320068359375, 0.818145751953125, 0.802490234375,
              0.796417236328125, 0.79620361328125, 0.809417724609375, 0.830078125, 0.850067138671875, 0.87017822265625,
              0.87786865234375, 0.87628173828125, 0.875823974609375, 0.875335693359375, 0.867889404296875,
              0.869781494140625, 0.87115478515625, 0.869476318359375, 0.874481201171875, 0.877227783203125,
              0.884185791015625, 0.890472412109375, 0.895751953125, 0.896820068359375
            ]
          },
          {
            "start": 2500,
            "end": 4000,
            "densities": [
              0.08221435546875, 0.09649658203125, 0.10797119140625, 0.11907958984375, 0.130035400390625,
              0.1356201171875, 0.135101318359375, 0.12530517578125, 0.110565185546875, 0.095550537109375,
              0.07904052734375, 0.072845458984375, 0.074127197265625, 0.0743408203125, 0.07452392578125,
              0.080596923828125, 0.07769775390625, 0.078460693359375, 0.0782470703125, 0.074798583984375,
              0.07415771484375, 0.0692138671875, 0.06475830078125, 0.0615234375, 0.0595703125
            ]
          },
          {
            "start": 4000,
            "densities": [
              0.048828125, 0.052581787109375, 0.057708740234375, 0.062774658203125, 0.067474365234375,
              0.067962646484375, 0.068695068359375, 0.065277099609375, 0.059356689453125, 0.05438232421875, 0.05078125,
              0.049285888671875, 0.049591064453125, 0.049835205078125, 0.050140380859375, 0.051513671875,
              0.052520751953125, 0.050384521484375, 0.052276611328125, 0.05072021484375, 0.048614501953125,
              0.046600341796875, 0.044769287109375, 0.042724609375, 0.043609619140625
            ]
          }
        ],
        "percentilesTimeseries": {
          "p75s": [
            1815, 1953, 2056, 2148, 2236, 2271, 2273, 2200, 2068, 1918, 1757, 1695, 1715, 1719, 1726, 1772, 1760, 1760,
            1762, 1726, 1701, 1657, 1618, 1579, 1556
          ]
        }
      }
    },
    "collectionPeriods": [
      {
        "firstDate": {
          "year": 2023,
          "month": 3,
          "day": 26
        },
        "lastDate": {
          "year": 2023,
          "month": 4,
          "day": 22
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 4,
          "day": 2
        },
        "lastDate": {
          "year": 2023,
          "month": 4,
          "day": 29
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 4,
          "day": 9
        },
        "lastDate": {
          "year": 2023,
          "month": 5,
          "day": 6
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 4,
          "day": 16
        },
        "lastDate": {
          "year": 2023,
          "month": 5,
          "day": 13
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 4,
          "day": 23
        },
        "lastDate": {
          "year": 2023,
          "month": 5,
          "day": 20
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 4,
          "day": 30
        },
        "lastDate": {
          "year": 2023,
          "month": 5,
          "day": 27
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 5,
          "day": 7
        },
        "lastDate": {
          "year": 2023,
          "month": 6,
          "day": 3
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 5,
          "day": 14
        },
        "lastDate": {
          "year": 2023,
          "month": 6,
          "day": 10
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 5,
          "day": 21
        },
        "lastDate": {
          "year": 2023,
          "month": 6,
          "day": 17
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 5,
          "day": 28
        },
        "lastDate": {
          "year": 2023,
          "month": 6,
          "day": 24
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 6,
          "day": 4
        },
        "lastDate": {
          "year": 2023,
          "month": 7,
          "day": 1
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 6,
          "day": 11
        },
        "lastDate": {
          "year": 2023,
          "month": 7,
          "day": 8
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 6,
          "day": 18
        },
        "lastDate": {
          "year": 2023,
          "month": 7,
          "day": 15
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 6,
          "day": 25
        },
        "lastDate": {
          "year": 2023,
          "month": 7,
          "day": 22
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 7,
          "day": 2
        },
        "lastDate": {
          "year": 2023,
          "month": 7,
          "day": 29
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 7,
          "day": 9
        },
        "lastDate": {
          "year": 2023,
          "month": 8,
          "day": 5
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 7,
          "day": 16
        },
        "lastDate": {
          "year": 2023,
          "month": 8,
          "day": 12
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 7,
          "day": 23
        },
        "lastDate": {
          "year": 2023,
          "month": 8,
          "day": 19
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 7,
          "day": 30
        },
        "lastDate": {
          "year": 2023,
          "month": 8,
          "day": 26
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 8,
          "day": 6
        },
        "lastDate": {
          "year": 2023,
          "month": 9,
          "day": 2
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 8,
          "day": 13
        },
        "lastDate": {
          "year": 2023,
          "month": 9,
          "day": 9
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 8,
          "day": 20
        },
        "lastDate": {
          "year": 2023,
          "month": 9,
          "day": 16
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 8,
          "day": 27
        },
        "lastDate": {
          "year": 2023,
          "month": 9,
          "day": 23
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 9,
          "day": 3
        },
        "lastDate": {
          "year": 2023,
          "month": 9,
          "day": 30
        }
      },
      {
        "firstDate": {
          "year": 2023,
          "month": 9,
          "day": 10
        },
        "lastDate": {
          "year": 2023,
          "month": 10,
          "day": 7
        }
      }
    ]
  }
}
```

</details>

<details>
  <summary>✅ 200: URL-level CrUX API data</summary><br>

```bash
curl -d url='https://github.com/marketplace?type=actions' \
     -d effectiveConnectionType=4G \
     -d formFactor=DESKTOP \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
```

```json
{
  "record": {
    "key": {
      "formFactor": "DESKTOP",
      "effectiveConnectionType": "4G",
      "url": "https://github.com/marketplace"
    },
    "metrics": {
      "cumulative_layout_shift": {
        "histogram": [
          {
            "start": "0.00",
            "end": "0.10",
            "density": 0.9430604982206409
          },
          {
            "start": "0.10",
            "end": "0.25",
            "density": 0.020804817957842878
          },
          {
            "start": "0.25",
            "density": 0.03613468382151657
          }
        ],
        "percentiles": {
          "p75": "0.02"
        }
      },
      "experimental_time_to_first_byte": {
        "histogram": [
          {
            "start": 0,
            "end": 800,
            "density": 0.9393059587999442
          },
          {
            "start": 800,
            "end": 1800,
            "density": 0.05378128024332917
          },
          {
            "start": 1800,
            "density": 0.006912760956726073
          }
        ],
        "percentiles": {
          "p75": 550
        }
      },
      "first_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 1800,
            "density": 0.9731800766283532
          },
          {
            "start": 1800,
            "end": 3000,
            "density": 0.017651888341543534
          },
          {
            "start": 3000,
            "density": 0.009168035030104028
          }
        ],
        "percentiles": {
          "p75": 809
        }
      },
      "first_input_delay": {
        "histogram": [
          {
            "start": 0,
            "end": 100,
            "density": 0.9936164307521526
          },
          {
            "start": 100,
            "end": 300,
            "density": 0.004579517069109083
          },
          {
            "start": 300,
            "density": 0.0018040521787399426
          }
        ],
        "percentiles": {
          "p75": 3
        }
      },
      "interaction_to_next_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 200,
            "density": 0.9759848893685868
          },
          {
            "start": 200,
            "end": 500,
            "density": 0.014301133297355571
          },
          {
            "start": 500,
            "density": 0.009713977334052826
          }
        ],
        "percentiles": {
          "p75": 50
        }
      },
      "largest_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 2500,
            "density": 0.9798854493386074
          },
          {
            "start": 2500,
            "end": 4000,
            "density": 0.012886949406791222
          },
          {
            "start": 4000,
            "density": 0.007227601254602516
          }
        ],
        "percentiles": {
          "p75": 895
        }
      }
    },
    "collectionPeriod": {
      "firstDate": {
        "year": 2023,
        "month": 9,
        "day": 15
      },
      "lastDate": {
        "year": 2023,
        "month": 10,
        "day": 12
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
  <summary>✅ 200: Origin-level CrUX API data</summary><br>

```bash
curl -d origin='https://github.com' \
     -d formFactor=PHONE \
     'https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=CRUX_API_KEY'
```

```json
{
  "record": {
    "key": {
      "formFactor": "PHONE",
      "origin": "https://github.com"
    },
    "metrics": {
      "first_input_delay": {
        "histogram": [
          {
            "start": 0,
            "end": 100,
            "density": 0.9498680738786286
          },
          {
            "start": 100,
            "end": 300,
            "density": 0.03430079155672826
          },
          {
            "start": 300,
            "density": 0.015831134564643756
          }
        ],
        "percentiles": {
          "p75": 17
        }
      },
      "interaction_to_next_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 200,
            "density": 0.6478405315614636
          },
          {
            "start": 200,
            "end": 500,
            "density": 0.24584717607973486
          },
          {
            "start": 500,
            "density": 0.10631229235880371
          }
        ],
        "percentiles": {
          "p75": 272
        }
      },
      "largest_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 2500,
            "density": 0.7900432900432863
          },
          {
            "start": 2500,
            "end": 4000,
            "density": 0.13528138528138467
          },
          {
            "start": 4000,
            "density": 0.0746753246753239
          }
        ],
        "percentiles": {
          "p75": 2312
        }
      },
      "cumulative_layout_shift": {
        "histogram": [
          {
            "start": "0.00",
            "end": "0.10",
            "density": 0.8527302813017104
          },
          {
            "start": "0.10",
            "end": "0.25",
            "density": 0.09817981246552682
          },
          {
            "start": "0.25",
            "density": 0.04908990623276335
          }
        ],
        "percentiles": {
          "p75": "0.02"
        }
      },
      "experimental_time_to_first_byte": {
        "histogram": [
          {
            "start": 0,
            "end": 800,
            "density": 0.6018518518518505
          },
          {
            "start": 800,
            "end": 1800,
            "density": 0.3312757201646084
          },
          {
            "start": 1800,
            "density": 0.0668724279835391
          }
        ],
        "percentiles": {
          "p75": 1039
        }
      },
      "first_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 1800,
            "density": 0.7165570175438571
          },
          {
            "start": 1800,
            "end": 3000,
            "density": 0.1781798245614029
          },
          {
            "start": 3000,
            "density": 0.10526315789473623
          }
        ],
        "percentiles": {
          "p75": 1934
        }
      }
    },
    "collectionPeriod": {
      "firstDate": {
        "year": 2023,
        "month": 9,
        "day": 15
      },
      "lastDate": {
        "year": 2023,
        "month": 10,
        "day": 12
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

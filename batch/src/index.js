/** @typedef {{ key: string, fetch?: function }} CreateBatchOptions */
/** @typedef {import('../../src').QueryRecordOptions[]} BatchOptions */
/** @typedef {(import('../../src').SuccessResponse | import('../../src').ErrorResponse)[]} BatchResponse */

const boundary = 'BATCH_BOUNDARY'

/**
 * Create batch interface for CrUX API.
 * https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/batch
 *
 * @param {CreateBatchOptions} createOptions
 */

export function createBatch(createOptions) {
  const key = createOptions.key
  const fetch = createOptions.fetch || window.fetch
  return batch

  /**
   * @param {BatchOptions} batchOptions
   * @return {Promise<BatchResponse>}
   */

  async function batch(batchOptions) {
    const body = generateBatchBody(batchOptions, key)
    const res = await fetch('https://chromeuxreport.googleapis.com/batch/', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/mixed; boundary=${boundary}` },
      body,
    })
    const text = await res.text()
    if (res.status !== 200) throw new Error(`Invalid batch response: ${text}`)
    return parseBatchResponse(text)
  }
}

/**
 * Generate multipart body for batch request.
 *
 * Example for `[{ origin: "https://github.com" }]`:
 *
 * --BATCH_BOUNDARY
 * Content-Type: application/http
 * Content-ID: 1
 *
 * POST /v1/records:queryRecord?key=${key}
 * Content-Type: application/json
 * Accept: application/json
 *
 * {
 *   "origin":"https://github.com"
 * }
 *
 * --BATCH_BOUNDARY--
 *
 * @param {BatchOptions} batchOptions
 * @param {string} key
 */

function generateBatchBody(batchOptions, key) {
  const strOpts = batchOptions.map((queryRecordOptions, index) => {
    return `--${boundary}
Content-Type: application/http
Content-ID: ${index + 1}

POST /v1/records:queryRecord?key=${key}
Content-Type: application/json
Accept: application/json

${JSON.stringify(queryRecordOptions, null, '  ')}
`
  })
  return strOpts.join('\n') + `\n--${boundary}--`
}

/**
 * Naive multipart parser:
 * - use Content-ID to find the response id
 * - use "{" as a start of a body and "}" as an end
 *
 * `text` example:
 *
 * --batch_acyIJf8nRW5t11AyZUOwieHC_eWk1alw
 * Content-Type: application/http
 * Content-ID: response-1
 *
 * HTTP/1.1 200 OK
 * Content-Type: application/json; charset=UTF-8
 * Vary: Origin
 * Vary: X-Origin
 * Vary: Referer
 *
 * {
 *   "record": {
 *     "key": {
 *       "origin": "https://example.com"
 *     },
 *     "metrics": {
 *       "cumulative_layout_shift": {
 *         "histogram": [
 *           {
 *             "start": "0.00",
 *             "end": "0.10",
 *             "density": 0.98919891989199
 *           },
 *           {
 *             "start": "0.10",
 *             "end": "0.25",
 *             "density": 0.0034003400340034034
 *           },
 *           {
 *             "start": "0.25",
 *             "density": 0.00740074007400741
 *           }
 *         ],
 *         "percentiles": {
 *           "p75": "0.04"
 *         }
 *       },
 *       "first_contentful_paint": {
 *         "histogram": [
 *           {
 *             "start": 0,
 *             "end": 1000,
 *             "density": 0.37636345441809338
 *           },
 *           {
 *             "start": 1000,
 *             "end": 3000,
 *             "density": 0.4767337135995206
 *           },
 *           {
 *             "start": 3000,
 *             "density": 0.14690283198238688
 *           }
 *         ],
 *         "percentiles": {
 *           "p75": 2207
 *         }
 *       },
 *       "first_input_delay": {
 *         "histogram": [
 *           {
 *             "start": 0,
 *             "end": 100,
 *             "density": 0.9704911473442015
 *           },
 *           {
 *             "start": 100,
 *             "end": 300,
 *             "density": 0.020806241872561727
 *           },
 *           {
 *             "start": 300,
 *             "density": 0.0087026107832349486
 *           }
 *         ],
 *         "percentiles": {
 *           "p75": 21
 *         }
 *       },
 *       "largest_contentful_paint": {
 *         "histogram": [
 *           {
 *             "start": 0,
 *             "end": 2500,
 *             "density": 0.79676870748299278
 *           },
 *           {
 *             "start": 2500,
 *             "end": 4000,
 *             "density": 0.1136954781912765
 *           },
 *           {
 *             "start": 4000,
 *             "density": 0.089535814325730309
 *           }
 *         ],
 *         "percentiles": {
 *           "p75": 2215
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * --batch_acyIJf8nRW5t11AyZUOwieHC_eWk1alw
 * Content-Type: application/http
 * Content-ID: response-2
 *
 * HTTP/1.1 404 Not Found
 * Vary: Origin
 * Vary: X-Origin
 * Vary: Referer
 * Content-Type: application/json; charset=UTF-8
 *
 * {
 *   "error": {
 *     "code": 404,
 *     "message": "chrome ux report data not found",
 *     "status": "NOT_FOUND"
 *   }
 * }
 *
 * --batch_acyIJf8nRW5t11AyZUOwieHC_eWk1alw--
 *
 * @param {string} text
 */

function parseBatchResponse(text) {
  const res = /** @type {BatchResponse} */ ([])
  let index = /** @type {number | null} */ (null)
  let contentBody = ''
  for (const line of text.split('\n')) {
    if (line.startsWith('Content-ID')) {
      const m = line.match(/response\-(\d*)/) || []
      index = parseInt(m[1])
    }
    if ((index && line.startsWith('{')) || contentBody) {
      contentBody += line
    }
    if (index && contentBody && line.startsWith('}')) {
      res[
        index - 1
      ] = /** @type {import('../../src').SuccessResponse | import('../../src').ErrorResponse} */ (JSON.parse(
        contentBody
      ))
      index = null
      contentBody = ''
    }
  }
  return res
}

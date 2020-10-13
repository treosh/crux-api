const queryRecord = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord'

/**
 * @typedef {{ url?: string, origin?: string, formFactor?: FormFactor, effectiveConnectionType?: Connection }} FetchParams
 * @typedef {'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET'} FormFactor
 * @typedef {'offline' | 'slow-2G' | '2G' | '3G' | '4G'} Connection
 * @typedef {{ histogram: { start: number | string, end: number | string, density: number }[], percentiles: { p75: number | string } }} MetricValue
 * @typedef {'first_contentful_paint' | 'largest_contentful_paint' | 'first_input_delay' | 'cumulative_layout_shift'} MetricName
 * @typedef {{
 *    record: {
 *      key: {
 *        url: string,
 *        effectiveConnectionType?: Connection,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: MetricValue,
 *        largest_contentful_paint?: MetricValue,
 *        first_input_delay?: MetricValue,
 *        cumulative_layout_shift?: MetricValue,
 *      }
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    }
 * }} SuccessResponse
 * @typedef {{ error: { code: number, message: string, status: string } }} ErrorResponse
 */

/**
 * Fetch CrUX API.
 * Inspired by: https://github.com/GoogleChrome/CrUX/blob/master/js/crux-api-util.js
 *
 * Handle errors:
 * {
 *   "code": 404,
 *   "message": "chrome ux report data not found",
 *   "status": "NOT_FOUND"
 * }
 * {
 *   "code":429,
 *   "message":"Quota exceeded for quota group 'default' and limit 'Queries per 100 seconds' of service 'chromeuxreport.googleapis.com' for consumer 'project_number:224801012400'.",
 *   "status":"RESOURCE_EXHAUSTED",
 *   "details":[{"@type":"type.googleapis.com/google.rpc.Help","links":[{"description":"Google developer console API key","url":"https://console.developers.google.com/project/224801012400/apiui/credential"}]}]
 * }
 * @param {{ key: string, fetch?: function, maxRetries?: number, maxRetryTimeout?: number }} options
 */

export function createCruxApi(options) {
  const key = options.key
  const fetch = options.fetch || window.fetch
  const maxRetries = options.maxRetries || 5
  const maxRetryTimeout = options.maxRetryTimeout || 60 * 1000 // 60s
  return fetchCruxApi

  /**
   * @param {FetchParams} params
   * @return {Promise<SuccessResponse | null>}
   */

  async function fetchCruxApi(params, retryCounter = 1) {
    const apiEndpoint = `${queryRecord}?key=${key}`
    const res = await fetch(apiEndpoint, { method: 'POST', body: JSON.stringify(params) })
    if (res.status !== 200) throw new Error(`Invalid status: ${res.status}`)

    const json = await res.json()
    if (json && json.error) {
      const { error } = /** @type {ErrorResponse} */ (json)
      if (error.code === 404) return null
      if (error.code === 429) {
        if (retryCounter <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, random(maxRetryTimeout)))
          return fetchCruxApi(params, retryCounter + 1)
        } else {
          throw new Error('Max retries reached')
        }
      }
      throw new Error(JSON.stringify(error))
    }
    if (!json || (json && !json.record.key.url)) throw new Error(`Invalid response: ${JSON.stringify(json)}`)
    return /** @type {SuccessResponse} */ (json)
  }
}

/**
 * Normalize URL to match CrUX API key.
 *
 * @param {string} url
 */

export function normalizeUrl(url) {
  const u = new URL(url)
  return u.origin + u.pathname
}

/**
 * Random from 1 to `max`.
 * Based on: https://stackoverflow.com/a/29246176
 *
 * @param {number} max
 */

function random(max) {
  return Math.floor(Math.random() * max) + 1
}

const maxRetries = 10
const maxRetryTimeout = 60 * 1000 // 60s

/**
 * @typedef {{ key: string, fetch?: function }} CreateOptions
 * @typedef {{ url?: string, origin?: string, formFactor?: FormFactor, effectiveConnectionType?: Connection }} QueryRecordOptions
 * @typedef {'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET'} FormFactor
 * @typedef {'4G' | '3G' | '2G' | 'slow-2G' | 'offline'} Connection
 * @typedef {{ histogram: { start: number | string, end: number | string, density: number }[], percentiles: { p75: number | string } }} MetricValue
 * @typedef {'first_contentful_paint' | 'largest_contentful_paint' | 'first_input_delay' | 'cumulative_layout_shift'} MetricName
 * @typedef {{ error: { code: number, message: string, status: string } }} ErrorResponse
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
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
 */

/**
 * Fetch CrUX API and handles 4xx errors.
 * Inspired by: https://github.com/GoogleChrome/CrUX/blob/master/js/crux-api-util.js
 *
 * @param {CreateOptions} createOptions
 */

export function createQueryRecord(createOptions) {
  const key = createOptions.key
  const fetch = createOptions.fetch || window.fetch
  return queryRecord

  /**
   * @param {QueryRecordOptions} queryOptions
   * @return {Promise<SuccessResponse | null>}
   */

  async function queryRecord(queryOptions, retryCounter = 1) {
    const apiEndpoint = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${key}`
    const res = await fetch(apiEndpoint, { method: 'POST', body: JSON.stringify(queryOptions) })
    if (res.status >= 500) throw new Error(`Invalid CrUX API status: ${res.status}`)

    const json = await res.json()
    if (json && json.error) {
      const { error } = /** @type {ErrorResponse} */ (json)
      if (error.code === 404) return null
      if (error.code === 429) return retryAfterTimeout(retryCounter, () => queryRecord(queryOptions, retryCounter + 1))
      throw new Error(JSON.stringify(error))
    }
    if (!json || (json && !json.record.key)) throw new Error(`Invalid response: ${JSON.stringify(json)}`)
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
 * Random delay from 1ms to `maxRetryTimeout`.
 * Random logic is based on: https://stackoverflow.com/a/29246176
 *
 * @param {number} retryCounter
 * @param {function} request
 */

export async function retryAfterTimeout(retryCounter, request) {
  if (retryCounter <= maxRetries) {
    const timeout = Math.floor(Math.random() * maxRetryTimeout) + 1
    await new Promise((resolve) => setTimeout(resolve, timeout))
    return request()
  } else {
    throw new Error('Max retries reached')
  }
}

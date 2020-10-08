const queryRecord = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord'

/**
 * @typedef {'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET'} CruxApiFormFactor
 * @typedef {'offline' | 'slow-2G' | '2G' | '3G' | '4G'} CruxApiConnection
 * @typedef {{ histogram: { start: number | string, end: number | string, density: number }[], percentiles: { p75: number | string } }} CruxApiMetric
 * @typedef {{
 *    record: {
 *      key: {
 *        url: string,
 *        effectiveConnectionType?: CruxApiConnection,
 *        formFactor?:CruxApiFormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: CruxApiMetric,
 *        largest_contentful_paint?: CruxApiMetric,
 *        first_input_delay?: CruxApiMetric,
 *        cumulative_layout_shift?: CruxApiMetric,
 *      }
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    }
 * }} CruxApiResponse
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
 * @param {{ key: string, fetch?: any, maxRetries?: number, maxRetryTimeout?: number }} options
 */

export function createCruxApi(options) {
  const key = options.key
  const fetch = options.fetch || window.fetch
  const maxRetries = options.maxRetries || 5
  const maxRetryTimeout = options.maxRetryTimeout || 60 * 1000 // 60s
  return fetchCruxApi

  /**
   * @param {{ url?: string, origin?: string, formFactor?: CruxApiFormFactor, effectiveConnectionType?: CruxApiConnection }} params
   * @return {Promise<CruxApiResponse | null>}
   */

  async function fetchCruxApi(params, retryCounter = 1) {
    const apiEndpoint = `${queryRecord}?key=${key}`
    const res = await fetch(apiEndpoint, { method: 'POST', body: JSON.stringify(params) })
    const json = await res.json()

    if (json.error) {
      if (json.error.code === 404) return null
      if (json.error.code === 429) {
        if (retryCounter <= maxRetries) {
          // random from 1 to maxRetryTimeout (https://stackoverflow.com/a/29246176)
          const retryTimeout = Math.floor(Math.random() * maxRetryTimeout) + 1
          await new Promise((resolve) => setTimeout(resolve, retryTimeout))
          return fetchCruxApi(params, retryCounter + 1)
        } else {
          throw new Error('Reached max retries')
        }
      }
      throw new Error(JSON.stringify(json.error))
    }
    if (json && !json.record.key.url) throw new Error(`Invalid response: ${JSON.stringify(json)}`)
    return json
  }
}

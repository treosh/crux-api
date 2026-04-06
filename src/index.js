const maxRetries = 10
const maxRetryTimeout = 60 * 1000 // 60s

/**
 * @typedef {{ key: string, fetch?: function }} CreateOptions
 * @typedef {{ url?: string, origin?: string, formFactor?: FormFactor, metrics?: string[] }} QueryRecordOptions
 * @typedef { QueryRecordOptions & { collectionPeriodCount?: number }} QueryHistoryRecordOptions
 * @typedef {'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET'} FormFactor
 * @typedef {{ percentiles: { p75: number } }} PercentileValue
 * @typedef {{ histogram: { start: number | string, end: number | string, density: number }[], percentiles: { p75: number | string } }} MetricValue
 * @typedef {{ histogram: { start: string, end: string, density: number }[], percentiles: { p75: string } }} MetricStringValue
 * @typedef {{ fractions: { desktop: number, phone: number, tablet: number } }} FormFactorFractionValue
 * @typedef {{ fractions: { image: number, text: number } }} NavigationTypesFractionValue
 * @typedef {{ fractions: { navigate: number, navigate_cache: number, back_forward: number, back_forward_cache: number, reload: number, restore: number, prerender: number } }} ResourceTypesFractionValue
 * @typedef {{ year: number, month: number, day: number }} MetricDate
 * @typedef {{ firstDate: MetricDate, lastDate: MetricDate }} CollectionPeriod
 * @typedef {{ error: { code: number, message: string, status: string } }} ErrorResponse
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: MetricValue,
 *        largest_contentful_paint?: MetricValue,
 *        cumulative_layout_shift?: MetricStringValue,
 *        interaction_to_next_paint?: MetricValue,
 *        experimental_time_to_first_byte?: MetricValue,
 *        round_trip_time?: MetricValue,
 *        form_factors?: FormFactorFractionValue,
 *        navigation_types?: NavigationTypesFractionValue,
 *        largest_contentful_paint_resource_type: ResourceTypesFractionValue,
 *        largest_contentful_paint_image_time_to_first_byte: PercentileValue,
 *        largest_contentful_paint_image_resource_load_delay: PercentileValue,
 *        largest_contentful_paint_image_resource_load_duration: PercentileValue,
 *        largest_contentful_paint_image_element_render_delay: PercentileValue,
 *      }
 *      collectionPeriod: CollectionPeriod
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    },
 * }} SuccessResponse
 *
 * @typedef {(?number | string)[]} PercentileValues
 * @typedef {{ start: number, end?: number, densities: (number | 'NaN')[] }} HistorgramTimeserie
 * @typedef {{
 *    histogramTimeseries: HistorgramTimeserie[],
 *    percentilesTimeseries: { p75s: PercentileValues }
 * }} HistoryValue
 *
 * @typedef {number | 'NaN'} DensityValue
 * @typedef {{ fractions: DensityValue[] }} Fractions
 * @typedef {Object<string, Fractions>} FractionTimeseries
 * @typedef {{ desktop: Fractions, phone: Fractions, tablet: Fractions }} FormFactorsFractionTimeseries
 * @typedef {{ back_forward_cache: Fractions, prerender: Fractions, navigate: Fractions, navigate_cache: Fractions, reload: Fractions, restore: Fractions, back_forward: Fractions }} NavigationTypesFractionTimeseries
 * @typedef {{ image: Fractions, text: Fractions }} ResourceTypesFractionTimeseries
 * @typedef {{ percentilesTimeseries: { p75s: (?number)[] } }} HistoryPercentile
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: HistoryValue,
 *        largest_contentful_paint?: HistoryValue,
 *        cumulative_layout_shift?: HistoryValue,
 *        interaction_to_next_paint?: HistoryValue,
 *        experimental_time_to_first_byte?: HistoryValue,
 *        round_trip_time?: HistoryValue,
 *        form_factors?: { fractionTimeseries: FormFactorsFractionTimeseries },
 *        navigation_types?: { fractionTimeseries: NavigationTypesFractionTimeseries },
 *        largest_contentful_paint_resource_type: { fractionTimeseries: ResourceTypesFractionTimeseries },
 *        largest_contentful_paint_image_time_to_first_byte: HistoryPercentile,
 *        largest_contentful_paint_image_resource_load_delay: HistoryPercentile,
 *        largest_contentful_paint_image_resource_load_duration: HistoryPercentile,
 *        largest_contentful_paint_image_element_render_delay: HistoryPercentile,
 *      }
 *      collectionPeriods: CollectionPeriod[]
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    },
 * }} HistoryResponse
 */

/** @param {CreateOptions} createOptions @return {function(QueryRecordOptions): Promise<SuccessResponse | null>} */
export function createQueryRecord(createOptions) {
  return createQueryCruxApi({ ...createOptions, api: 'record' })
}

/** @param {CreateOptions} createOptions @return {function(QueryHistoryRecordOptions): Promise<HistoryResponse | null>} */
export function createQueryHistoryRecord(createOptions) {
  return createQueryCruxApi({ ...createOptions, api: 'history' })
}

/**
 * Fetch CrUX API and handles 4xx errors.
 * Inspired by: https://github.com/GoogleChrome/CrUX/blob/master/js/crux-api-util.js
 *
 * @param {CreateOptions & { api: 'history' | 'record' }} createOptions
 */

function createQueryCruxApi(createOptions) {
  const key = createOptions.key
  const fetch = createOptions.fetch || window.fetch
  const apiMethod = createOptions.api === 'history' ? 'queryHistoryRecord' : 'queryRecord'
  return queryCruxApi

  /**
   * @param {QueryRecordOptions | QueryHistoryRecordOptions} queryOptions
   * @return {Promise<any | null>}
   */

  async function queryCruxApi(queryOptions, retryCounter = 1) {
    const apiEndpoint = `https://chromeuxreport.googleapis.com/v1/records:${apiMethod}?key=${key}`
    const res = await fetch(apiEndpoint, { method: 'POST', body: JSON.stringify(queryOptions) })
    if (res.status >= 500) throw new Error(`Invalid CrUX API status: ${res.status}`)

    const json = await res.json()
    if (json && json.error) {
      const { error } = /** @type {ErrorResponse} */ (json)
      if (error.code === 404) return null
      if (error.code === 429) return retryAfterTimeout(retryCounter, () => queryCruxApi(queryOptions, retryCounter + 1))
      throw new Error(JSON.stringify(error))
    }
    if (!json || (json && !json.record.key)) throw new Error(`Invalid response: ${JSON.stringify(json)}`)
    return json
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

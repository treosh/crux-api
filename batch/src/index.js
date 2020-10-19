/** @typedef {{ key: string, fetch?: function }} CreateBatchOptions */
/** @typedef {import('../../src').FetchParams[]} BatchOptions */

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
   * @param {BatchOptions} params
   * @return {Promise<(SuccessResponse | null)[]>}
   */

  function batch(batchOptions) {}
}

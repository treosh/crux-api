const maxRetries = 10
const maxRetryTimeout = 100 * 1000 // 100s

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

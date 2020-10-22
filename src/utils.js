/**
 * Random delay from 1ms to `max`.
 * Random logic is based on: https://stackoverflow.com/a/29246176
 *
 * @param {number} max
 */

export function randomDelay(max) {
  const timeout = Math.floor(Math.random() * max) + 1
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

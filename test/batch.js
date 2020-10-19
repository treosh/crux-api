// yarn ava test/batch.js
import test from 'ava'
import fetch from 'node-fetch'
import { createBatch } from '../batch/src'

const key = process.env.CRUX_KEY || 'no-key'

test('createBatch', async (t) => {
  const batch = createBatch({ key, fetch })
  const results1 = await batch([
    { origin: 'https://github.com', formFactor: 'DESKTOP' },
    { url: 'https://github.com/explore', effectiveConnectionType: '4G' },
  ])
  t.is(results1.length, 2)

  const r1 = /** @type {import('../src').SuccessResponse} */ (results1[0])
  t.is(r1.record.key.origin, 'https://github.com')
  t.deepEqual(Object.keys(r1.record.key), ['formFactor', 'origin'])

  const r2 = /** @type {import('../src').SuccessResponse} */ (results1[1])
  t.is(r2.record.key.url, 'https://github.com/explore')
  t.deepEqual(Object.keys(r2.record.key), ['effectiveConnectionType', 'url'])
})

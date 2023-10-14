// usage:
// • CRUX_KEY='...' node script/crux-api.js record '{"origin": "https://example.com", "formFactor": "DESKTOP", "effectiveConnectionType": "4G" }' > results/record-example.json
// • CRUX_KEY='...' node script/crux-api.js history '{"url": "https://www.apple.com/", "formFactor": "PHONE" }' > results/history-apple.json

import nodeFetch from 'node-fetch'
import { createQueryRecord, createQueryHistoryRecord } from '../src/index.js'

const key = process.env.CRUX_KEY || 'no-key'
const apiMethod = process.argv[2] || 'record'
const params = JSON.parse(process.argv[3] || '')

try {
  const createMethod = apiMethod === 'record' ? createQueryRecord : createQueryHistoryRecord
  const queryMethod = createMethod({ key, fetch: nodeFetch })
  const res = await queryMethod(params)
  console.log(JSON.stringify(res, null, '  '))
} catch (err) {
  console.error(err)
}

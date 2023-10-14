// usage: CRUX_KEY='...' node script/queryRecord.js '{"origin": "https://example.com", "formFactor": "DESKTOP"}'

import nodeFetch from 'node-fetch'
import { createQueryRecord } from '../src/index.js'

const key = process.env.CRUX_KEY || 'no-key'
const params = JSON.parse(process.argv[2] || '')

try {
  const queryRecord = createQueryRecord({ key, fetch: nodeFetch })
  const res = await queryRecord(params)
  console.log(JSON.stringify(res, null, '  '))
} catch (err) {
  console.error(err)
}

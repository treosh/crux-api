// usage: CRUX_KEY='...' node -r esm script/queryRecord.js '{"origin": "https://example.com", "formFactor": "DESKTOP"}'
import nodeFetch from 'node-fetch'
import { createQueryRecord } from '../src'

const key = process.env.CRUX_KEY || 'no-key'
const params = JSON.parse(process.argv[2] || '')

async function main() {
  const queryRecord = createQueryRecord({ key, fetch: nodeFetch })
  const res = await queryRecord(params)
  console.log(JSON.stringify(res, null, '  '))
}

main().catch(console.error)

// usage: CRUX_KEY='...' node -r esm script/batch.js
import nodeFetch from 'node-fetch'
import { createBatch } from '../batch'

const key = process.env.CRUX_KEY || 'no-key'

async function main() {
  const batch = createBatch({ key, fetch: nodeFetch })
  const res = await batch([
    { origin: 'https://example.com' },
    { url: 'https://github.com/', formFactor: 'DESKTOP' },
    { origin: 'https://fooo.bar' },
  ])
  console.log(JSON.stringify(res, null, '  '))
}

main().catch(console.error)

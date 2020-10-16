// install googleapis: yarn add -D googleapis
// run: CRUX_KEY='...' node script/query-with-googleapis.js

import { google } from 'googleapis'

const key = process.env.CRUX_KEY || 'no-key'
const crux = google.chromeuxreport('v1')
crux.records
  .queryRecord({ auth: key, requestBody: { origin: 'https://example.com' } })
  .then((r) => console.log(JSON.stringify(r.data, null, '  ')), console.error)

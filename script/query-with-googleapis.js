// install googleapis: yarn add googleapis
// run: CRUX_KEY='...' node script/query-with-googleapis.js

import { google } from 'googleapis'

const key = process.env.CRUX_KEY || 'no-key'
const crux = google.chromeuxreport('v1')
crux.records
  .queryRecord({ auth: key, requestBody: { origin: 'https://example.com' } })
  .then((r) => console.log(JSON.stringify(r.data, null, '  ')), console.error)

// How is crux-api different from googleapis?
// Pros:
// + It is focused and lightweight 23.7 kB vs 75.7 MB (3200 times smaller)
// + It is isomorphic, works in a browser and node.js;
// + It handles 404 & 429 errors automatically;
// + Documentation is easier to follow;
// + It is easier to fork, contribute, and understand the code;
// + It supports batch requests (since v1.1).
// Cons:
// - It's an extra dependency package, that's build not by Google

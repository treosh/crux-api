// usage: CRUX_KEY='...' node -r esm script/batch.js
import fetch from 'node-fetch'

async function main() {
  const key = process.env.CRUX_KEY || 'no-key'
  const res = await fetch('https://chromeuxreport.googleapis.com/batch/', {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/mixed; boundary=BATCH_BOUNDARY' },
    body: `
--BATCH_BOUNDARY
Content-Type: application/http
Content-ID: 1

POST /v1/records:queryRecord?key=${key}
Content-Type: application/json
Accept: application/json

{
  "origin":"https://example.com"
}

--BATCH_BOUNDARY
Content-Type: application/http
Content-ID: 2

POST /v1/records:queryRecord?key=${key}
Content-Type: application/json
Accept: application/json

{
  "origin":"https://www.foobar.bax"
}

--BATCH_BOUNDARY--
    `,
  })
  const text = await res.text()
  console.log(text)

  // naive multipart parser:
  // - use Content-ID to find the response id
  // - use "{" as a start of a body and "}" as an end

  const contentIdRegexp = /response\-(\d*)/
  let contentId = null
  let contentBody = ''
  for (const line of text.split('\n')) {
    if (line.startsWith('Content-ID')) {
      const m = line.match(contentIdRegexp) || []
      contentId = parseInt(m[1])
    }
    if ((contentId && line.startsWith('{')) || contentBody) {
      contentBody += line
    }
    if (contentBody && line.startsWith('}')) {
      console.log(contentId, JSON.parse(contentBody))
      contentId = null
      contentBody = ''
    }
  }
}

main().catch(console.error)

// response example:
//
// --batch_acyIJf8nRW5t11AyZUOwieHC_eWk1alw
// Content-Type: application/http
// Content-ID: response-1
//
// HTTP/1.1 200 OK
// Content-Type: application/json; charset=UTF-8
// Vary: Origin
// Vary: X-Origin
// Vary: Referer
//
// {
//   "record": {
//     "key": {
//       "origin": "https://example.com"
//     },
//     "metrics": {
//       "cumulative_layout_shift": {
//         "histogram": [
//           {
//             "start": "0.00",
//             "end": "0.10",
//             "density": 0.98919891989199
//           },
//           {
//             "start": "0.10",
//             "end": "0.25",
//             "density": 0.0034003400340034034
//           },
//           {
//             "start": "0.25",
//             "density": 0.00740074007400741
//           }
//         ],
//         "percentiles": {
//           "p75": "0.04"
//         }
//       },
//       "first_contentful_paint": {
//         "histogram": [
//           {
//             "start": 0,
//             "end": 1000,
//             "density": 0.37636345441809338
//           },
//           {
//             "start": 1000,
//             "end": 3000,
//             "density": 0.4767337135995206
//           },
//           {
//             "start": 3000,
//             "density": 0.14690283198238688
//           }
//         ],
//         "percentiles": {
//           "p75": 2207
//         }
//       },
//       "first_input_delay": {
//         "histogram": [
//           {
//             "start": 0,
//             "end": 100,
//             "density": 0.9704911473442015
//           },
//           {
//             "start": 100,
//             "end": 300,
//             "density": 0.020806241872561727
//           },
//           {
//             "start": 300,
//             "density": 0.0087026107832349486
//           }
//         ],
//         "percentiles": {
//           "p75": 21
//         }
//       },
//       "largest_contentful_paint": {
//         "histogram": [
//           {
//             "start": 0,
//             "end": 2500,
//             "density": 0.79676870748299278
//           },
//           {
//             "start": 2500,
//             "end": 4000,
//             "density": 0.1136954781912765
//           },
//           {
//             "start": 4000,
//             "density": 0.089535814325730309
//           }
//         ],
//         "percentiles": {
//           "p75": 2215
//         }
//       }
//     }
//   }
// }
//
// --batch_acyIJf8nRW5t11AyZUOwieHC_eWk1alw
// Content-Type: application/http
// Content-ID: response-2
//
// HTTP/1.1 404 Not Found
// Vary: Origin
// Vary: X-Origin
// Vary: Referer
// Content-Type: application/json; charset=UTF-8
//
// {
//   "error": {
//     "code": 404,
//     "message": "chrome ux report data not found",
//     "status": "NOT_FOUND"
//   }
// }
//
// --batch_acyIJf8nRW5t11AyZUOwieHC_eWk1alw--

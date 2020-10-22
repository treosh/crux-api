// A script to test batch API limits using Github's URLs & origins.
// Script generates 312 + 720 requests, which quicly exaust CrUX API limits for the `key`.
//
// Check the data using the node CLI:
//
// > o = require('./result/origins3.json')
// > o.length
// 312
// > new Set(o.filter(v => v.error).map(v => v.error.code))
// Set { 429, 404 }
//
// usage: CRUX_KEY='...' node -r esm script/batch-limits.js 1

import nodeFetch from 'node-fetch'
import { promises as fs } from 'fs'
import { join } from 'path'
import { createBatch } from '../batch/src'

const key = process.env.CRUX_KEY || 'no-key'
const suffix = process.argv[2] || '' // the suffix for `result/${origins|urls}${suffix}.json` file
const origins = [
  'https://github.com',
  'https://resources.github.com',
  'https://developer.github.com',
  'https://atom.io',
  'https://www.electronjs.org',
  'https://desktop.github.com',
  'https://partner.github.com',
  'https://docs.github.com',
  'https://www.githubstatus.com',
  'https://support.github.com',
  'https://github.myshopify.com',
  'https://socialimpact.github.com',
  'https://github.blog',
]
const urls = [
  'https://github.com/',
  'https://github.com/team',
  'https://github.com/enterprise',
  'https://github.com/marketplace',
  'https://github.com/pricing',
  'https://github.com/explore',
  'https://github.com/login?return_to=%2Fexplore',
  'https://github.com/join?ref_cta=Sign+up&ref_loc=header+logged+out&ref_page=%2Fexplore&source=header',
  'https://github.com/features',
  'https://github.com/features/actions',
  'https://github.com/features/code-review/',
  'https://github.com/features/project-management/',
  'https://github.com/security',
  'https://github.com/customer-stories?type=enterprise',
  'https://github.com/about',
  'https://github.com/about/careers',
  'https://github.com/about/press',
  'https://resources.github.com/',
  'https://developer.github.com/',
  'https://atom.io/',
  'https://www.electronjs.org/',
  'https://desktop.github.com/',
  'https://partner.github.com/',
  'https://docs.github.com/',
  'https://www.githubstatus.com/',
  'https://support.github.com/',
  'https://github.myshopify.com/',
  'https://socialimpact.github.com/',
  'https://github.blog/',
  'https://github.blog/changelog/',
]
const formFactors = /** @type {import('../src').FormFactor[]} */ ([undefined, 'PHONE', 'DESKTOP', 'TABLET'])
const connections = /** @type {import('../src').Connection[]} */ ([undefined, '4G', '3G', '2G', 'slow-2G', 'offline'])

async function main() {
  const batch = createBatch({ key, fetch: nodeFetch })
  console.time('fetch origins')
  const res1 = await batch(
    origins.reduce((memo, origin) => {
      for (const formFactor of formFactors) {
        for (const effectiveConnectionType of connections) {
          memo.push({ origin, formFactor, effectiveConnectionType })
        }
      }
      return memo
    }, /** @type {import('../src').BatchOptions} */ ([]))
  )
  await fs.writeFile(join(__dirname, `../result/origins${suffix}.json`), JSON.stringify(res1, null, '  '))
  console.timeEnd('fetch origins')

  console.time('fetch urls')
  const res2 = await batch(
    urls.reduce((memo, url) => {
      for (const formFactor of formFactors) {
        for (const effectiveConnectionType of connections) {
          memo.push({ url, formFactor, effectiveConnectionType })
        }
      }
      return memo
    }, /** @type {import('../src').BatchOptions} */ ([]))
  )
  await fs.writeFile(join(__dirname, `../result/urls${suffix}.json`), JSON.stringify(res2, null, '  '))
  console.timeEnd('fetch urls')
}

main().catch(console.error)

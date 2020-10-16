import test from 'ava'
import fetch from 'node-fetch'
import { createCruxApi, normalizeUrl } from '../src'

const key = process.env.CRUX_KEY || 'no-key'

test('createCruxApi', async (t) => {
  const queryRecord = createCruxApi({ key, fetch })
  const json1 = await queryRecord({ url: 'https://github.com/', formFactor: 'DESKTOP' })
  t.truthy(json1)
  if (json1) {
    t.is(json1.record.key.url, 'https://github.com/')
    t.is(json1.record.key.formFactor, 'DESKTOP')
  }

  const json2 = await queryRecord({ origin: 'https://github.com', effectiveConnectionType: '3G' })
  t.truthy(json2)
  if (json2) {
    t.is(json2.record.key.origin, 'https://github.com')
    t.is(json2.record.key.effectiveConnectionType, '3G')
  }
})

test('normalizeUrl', async (t) => {
  const queryRecord = createCruxApi({ key, fetch })
  const urls = [
    ['https://www.gov.uk', 'https://www.gov.uk/'], // adds /
    ['https://hey.com/features/', 'https://hey.com/features/'], // no change, URL with /
    ['https://stripe.com/docs/api', 'https://stripe.com/docs/api'], // no change, URL without /
    ['https://github.com/marketplace?type=actions', 'https://github.com/marketplace'], // removes search params
  ]
  for (const [unnormalizedUrl, cruxUrl] of urls) {
    t.is(normalizeUrl(unnormalizedUrl), cruxUrl)
    const json = await queryRecord({ url: unnormalizedUrl })
    if (!json) throw new Error(`No JSON for ${unnormalizedUrl}`)
    t.is(json.record.key.url, cruxUrl)
  }
})

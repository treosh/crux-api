import test from 'ava'
import fetch from 'node-fetch'
import { createCruxApi, normalizeUrl } from '../src'

const key = process.env.CRUX_KEY || 'no-key'

test('normalizeUrl', async (t) => {
  const fetchCruxApi = createCruxApi({ key, fetch })
  const urls = [
    ['https://www.gov.uk', 'https://www.gov.uk/'],
    ['https://hey.com/features/', 'https://hey.com/features/'],
    ['https://stripe.com/docs/api', 'https://stripe.com/docs/api'],
    ['https://github.com/marketplace?type=actions', 'https://github.com/marketplace'],
  ]
  for (const [unnormalizedUrl, cruxUrl] of urls) {
    t.is(normalizeUrl(unnormalizedUrl), cruxUrl)
    const json = await fetchCruxApi({ url: unnormalizedUrl })
    if (!json) throw new Error(`No JSON for ${unnormalizedUrl}`)
    t.is(json.record.key.url, cruxUrl)
    // TODO: fetch CrUX API and ensure normalization
  }
})

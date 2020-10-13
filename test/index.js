import test from 'ava'
import { normalizeUrl } from '../src'

test('normalizeUrl', (t) => {
  const urls = [
    ['https://www.gov.uk', 'https://www.gov.uk/'],
    ['https://hey.com/features/', 'https://hey.com/features/'],
    ['https://stripe.com/docs/api', 'https://stripe.com/docs/api'],
    ['https://github.com/search?q=crux-api', 'https://github.com/search'],
  ]
  for (const [unnormalizedUrl, cruxUrl] of urls) {
    t.is(normalizeUrl(unnormalizedUrl), cruxUrl)
    // TODO: fetch CrUX API and ensure normalization
  }
})

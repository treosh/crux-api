// usage: CRUX_KEY='...' yarn ava test/index.js

import test from 'ava'
import fetch from 'node-fetch'
import { createQueryRecord, createQueryHistoryRecord, normalizeUrl } from '../src/index.js'

const key = process.env.CRUX_KEY || 'no-key'

test('createQueryRecord', async (t) => {
  const queryRecord = createQueryRecord({ key, fetch })
  const json1 = await queryRecord({
    url: 'https://github.com/',
    formFactor: 'DESKTOP',
    metrics: ['cumulative_layout_shift'],
  })

  t.is(json1?.record.key.url, 'https://github.com/')
  t.is(json1?.record.key.formFactor, 'DESKTOP')
  t.is(Object.keys(json1?.record.metrics ?? {}).length, 1)
})

test('createQueryHistoryRecord', async (t) => {
  const queryHistory = createQueryHistoryRecord({ key, fetch })
  const json1 = await queryHistory({
    url: 'https://github.com/',
    formFactor: 'DESKTOP',
    metrics: ['cumulative_layout_shift'],
    collectionPeriodCount: 20,
  })

  t.is(json1?.record.key.url, 'https://github.com/')
  t.is(json1?.record.key.formFactor, 'DESKTOP')
  t.is(Object.keys(json1?.record.metrics ?? {}).length, 1)
  t.is(json1?.record.collectionPeriods.length, 20)
  t.is(json1?.record.metrics.cumulative_layout_shift?.histogramTimeseries.length, 3)
  t.is(json1?.record.metrics.cumulative_layout_shift?.histogramTimeseries[0]?.densities.length, 20)
})

test('normalizeUrl', async (t) => {
  const queryRecord = createQueryRecord({ key, fetch })
  const urls = [
    ['https://www.gov.uk', 'https://www.gov.uk/'], // adds /
    ['https://www.hey.com/features/', 'https://www.hey.com/features/'], // no change, URL with /
    ['https://stripe.com/payments', 'https://stripe.com/payments'], // no change, URL without /
    ['https://github.com/marketplace?type=actions', 'https://github.com/marketplace'], // removes search params
  ]
  for (const [unnormalizedUrl, cruxUrl] of urls) {
    t.is(normalizeUrl(unnormalizedUrl), cruxUrl)
    const json = await queryRecord({ url: unnormalizedUrl })
    if (!json) throw new Error(`No JSON for ${unnormalizedUrl}`)
    t.is(json.record.key.url, cruxUrl)
  }
})

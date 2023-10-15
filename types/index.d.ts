/**
 * @typedef {{ key: string, fetch?: function }} CreateOptions
 * @typedef {{ url?: string, origin?: string, formFactor?: FormFactor, effectiveConnectionType?: Connection }} QueryRecordOptions
 * @typedef {'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET'} FormFactor
 * @typedef {'4G' | '3G' | '2G' | 'slow-2G' | 'offline'} Connection
 * @typedef {{ histogram: { start: number | string, end: number | string, density: number }[], percentiles: { p75: number | string } }} MetricValue
 * @typedef {{ year: number, month: number, day: number }} MetricDate
 * @typedef {{ firstDate: MetricDate, lastDate: MetricDate }} CollectionPeriod
 * @typedef {{ error: { code: number, message: string, status: string } }} ErrorResponse
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
 *        effectiveConnectionType?: Connection,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: MetricValue,
 *        largest_contentful_paint?: MetricValue,
 *        first_input_delay?: MetricValue,
 *        cumulative_layout_shift?: MetricValue,
 *        interaction_to_next_paint?: MetricValue,
 *        experimental_time_to_first_byte?: MetricValue,
 *      },
 *      collectionPeriod: CollectionPeriod
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    }
 * }} SuccessResponse
 *
 * @typedef {(?number | string)[]} PercentileValues
 * @typedef {{ start: number, end?: number, densities: (number | 'NaN')[] }} HistorgramTimeserie
 * @typedef {{
 *    histogramTimeseries: HistorgramTimeserie[],
 *    percentilesTimeseries: { p75s: PercentileValues }
 * }} HistoryValue
 *
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_input_delay?: HistoryValue,
 *        first_contentful_paint?: HistoryValue,
 *        largest_contentful_paint?: HistoryValue,
 *        cumulative_layout_shift?: HistoryValue,
 *        interaction_to_next_paint?: HistoryValue,
 *        experimental_time_to_first_byte?: HistoryValue,
 *      }
 *      collectionPeriods: CollectionPeriod[]
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    },
 * }} HistoryResponse
 */
/** @param {CreateOptions} createOptions @return {function(QueryRecordOptions): Promise<SuccessResponse | null>} */
export function createQueryRecord(createOptions: CreateOptions): (arg0: QueryRecordOptions) => Promise<SuccessResponse | null>;
/** @param {CreateOptions} createOptions @return {function(QueryRecordOptions): Promise<HistoryResponse | null>} */
export function createQueryHistoryRecord(createOptions: CreateOptions): (arg0: QueryRecordOptions) => Promise<HistoryResponse | null>;
/**
 * Normalize URL to match CrUX API key.
 *
 * @param {string} url
 */
export function normalizeUrl(url: string): string;
/**
 * Random delay from 1ms to `maxRetryTimeout`.
 * Random logic is based on: https://stackoverflow.com/a/29246176
 *
 * @param {number} retryCounter
 * @param {function} request
 */
export function retryAfterTimeout(retryCounter: number, request: Function): Promise<any>;
export type CreateOptions = {
    key: string;
    fetch?: Function;
};
export type QueryRecordOptions = {
    url?: string;
    origin?: string;
    formFactor?: FormFactor;
    effectiveConnectionType?: Connection;
};
export type FormFactor = 'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET';
export type Connection = '4G' | '3G' | '2G' | 'slow-2G' | 'offline';
export type MetricValue = {
    histogram: {
        start: number | string;
        end: number | string;
        density: number;
    }[];
    percentiles: {
        p75: number | string;
    };
};
export type MetricDate = {
    year: number;
    month: number;
    day: number;
};
export type CollectionPeriod = {
    firstDate: MetricDate;
    lastDate: MetricDate;
};
export type ErrorResponse = {
    error: {
        code: number;
        message: string;
        status: string;
    };
};
export type SuccessResponse = {
    record: {
        key: {
            url?: string;
            origin?: string;
            effectiveConnectionType?: Connection;
            formFactor?: FormFactor;
        };
        metrics: {
            first_contentful_paint?: MetricValue;
            largest_contentful_paint?: MetricValue;
            first_input_delay?: MetricValue;
            cumulative_layout_shift?: MetricValue;
            interaction_to_next_paint?: MetricValue;
            experimental_time_to_first_byte?: MetricValue;
        };
        collectionPeriod: CollectionPeriod;
    };
    urlNormalizationDetails?: {
        originalUrl: string;
        normalizedUrl: string;
    };
};
export type PercentileValues = ((number | string) | null)[];
export type HistorgramTimeserie = {
    start: number;
    end?: number;
    densities: (number | 'NaN')[];
};
export type HistoryValue = {
    histogramTimeseries: HistorgramTimeserie[];
    percentilesTimeseries: {
        p75s: (string | number)[];
    };
};
export type HistoryResponse = {
    record: {
        key: {
            url?: string;
            origin?: string;
            formFactor?: FormFactor;
        };
        metrics: {
            first_input_delay?: HistoryValue;
            first_contentful_paint?: HistoryValue;
            largest_contentful_paint?: HistoryValue;
            cumulative_layout_shift?: HistoryValue;
            interaction_to_next_paint?: HistoryValue;
            experimental_time_to_first_byte?: HistoryValue;
        };
        collectionPeriods: CollectionPeriod[];
    };
    urlNormalizationDetails?: {
        originalUrl: string;
        normalizedUrl: string;
    };
};

/**
 * @typedef {{ key: string, fetch?: function }} CreateOptions
 * @typedef {{ url?: string, origin?: string, formFactor?: FormFactor }} QueryRecordOptions
 * @typedef {'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP' | 'TABLET'} FormFactor
 * @typedef {{ percentiles: { p75: number } }} PercentileValue
 * @typedef {{ histogram: { start: number | string, end: number | string, density: number }[], percentiles: { p75: number | string } }} MetricValue
 * @typedef {{ histogram: { start: string, end: string, density: number }[], percentiles: { p75: string } }} MetricStringValue
 * @typedef {{ fractions: { desktop: number, phone: number, tablet: number } }} FormFactorFractionValue
 * @typedef {{ fractions: { image: number, text: number } }} NavigationTypesFractionValue
 * @typedef {{ fractions: { navigate: number, navigate_cache: number, back_forward: number, back_forward_cache: number, reload: number, restore: number, prerender: number } }} ResourceTypesFractionValue
 * @typedef {{ year: number, month: number, day: number }} MetricDate
 * @typedef {{ firstDate: MetricDate, lastDate: MetricDate }} CollectionPeriod
 * @typedef {{ error: { code: number, message: string, status: string } }} ErrorResponse
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: MetricValue,
 *        largest_contentful_paint?: MetricValue,
 *        cumulative_layout_shift?: MetricStringValue,
 *        interaction_to_next_paint?: MetricValue,
 *        experimental_time_to_first_byte?: MetricValue,
 *        round_trip_time?: MetricValue,
 *        form_factors?: FormFactorFractionValue,
 *        navigation_types?: NavigationTypesFractionValue,
 *        largest_contentful_paint_resource_type: ResourceTypesFractionValue,
 *        largest_contentful_paint_image_time_to_first_byte: PercentileValue,
 *        largest_contentful_paint_image_resource_load_delay: PercentileValue,
 *        largest_contentful_paint_image_resource_load_duration: PercentileValue,
 *        largest_contentful_paint_image_element_render_delay: PercentileValue,
 *      }
 *      collectionPeriod: CollectionPeriod
 *    },
 *    urlNormalizationDetails?: {
 *      originalUrl: string,
 *      normalizedUrl: string
 *    },
 * }} SuccessResponse
 *
 * @typedef {(?number | string)[]} PercentileValues
 * @typedef {{ start: number, end?: number, densities: (number | 'NaN')[] }} HistorgramTimeserie
 * @typedef {{
 *    histogramTimeseries: HistorgramTimeserie[],
 *    percentilesTimeseries: { p75s: PercentileValues }
 * }} HistoryValue
 *
 * @typedef {number | 'NaN'} DensityValue
 * @typedef {{ fractions: DensityValue[] }} Fractions
 * @typedef {Object<string, Fractions>} FractionTimeseries
 * @typedef {{ desktop: Fractions, phone: Fractions, tablet: Fractions }} FormFactorsFractionTimeseries
 * @typedef {{ back_forward_cache: Fractions, prerender: Fractions, navigate: Fractions, navigate_cache: Fractions, reload: Fractions, restore: Fractions, back_forward: Fractions }} NavigationTypesFractionTimeseries
 * @typedef {{ image: Fractions, text: Fractions }} ResourceTypesFractionTimeseries
 * @typedef {{ percentilesTimeseries: { p75s: (?number)[] } }} HistoryPercentile
 * @typedef {{
 *    record: {
 *      key: {
 *        url?: string,
 *        origin?: string,
 *        formFactor?: FormFactor
 *      },
 *      metrics: {
 *        first_contentful_paint?: HistoryValue,
 *        largest_contentful_paint?: HistoryValue,
 *        cumulative_layout_shift?: HistoryValue,
 *        interaction_to_next_paint?: HistoryValue,
 *        experimental_time_to_first_byte?: HistoryValue,
 *        round_trip_time?: HistoryValue,
 *        form_factors?: { fractionTimeseries: FormFactorsFractionTimeseries },
 *        navigation_types?: { fractionTimeseries: NavigationTypesFractionTimeseries },
 *        largest_contentful_paint_resource_type: { fractionTimeseries: ResourceTypesFractionTimeseries },
 *        largest_contentful_paint_image_time_to_first_byte: HistoryPercentile,
 *        largest_contentful_paint_image_resource_load_delay: HistoryPercentile,
 *        largest_contentful_paint_image_resource_load_duration: HistoryPercentile,
 *        largest_contentful_paint_image_element_render_delay: HistoryPercentile,
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
};
export type FormFactor = "ALL_FORM_FACTORS" | "PHONE" | "DESKTOP" | "TABLET";
export type PercentileValue = {
    percentiles: {
        p75: number;
    };
};
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
export type MetricStringValue = {
    histogram: {
        start: string;
        end: string;
        density: number;
    }[];
    percentiles: {
        p75: string;
    };
};
export type FormFactorFractionValue = {
    fractions: {
        desktop: number;
        phone: number;
        tablet: number;
    };
};
export type NavigationTypesFractionValue = {
    fractions: {
        image: number;
        text: number;
    };
};
export type ResourceTypesFractionValue = {
    fractions: {
        navigate: number;
        navigate_cache: number;
        back_forward: number;
        back_forward_cache: number;
        reload: number;
        restore: number;
        prerender: number;
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
            formFactor?: FormFactor;
        };
        metrics: {
            first_contentful_paint?: MetricValue;
            largest_contentful_paint?: MetricValue;
            cumulative_layout_shift?: MetricStringValue;
            interaction_to_next_paint?: MetricValue;
            experimental_time_to_first_byte?: MetricValue;
            round_trip_time?: MetricValue;
            form_factors?: FormFactorFractionValue;
            navigation_types?: NavigationTypesFractionValue;
            largest_contentful_paint_resource_type: ResourceTypesFractionValue;
            largest_contentful_paint_image_time_to_first_byte: PercentileValue;
            largest_contentful_paint_image_resource_load_delay: PercentileValue;
            largest_contentful_paint_image_resource_load_duration: PercentileValue;
            largest_contentful_paint_image_element_render_delay: PercentileValue;
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
    densities: (number | "NaN")[];
};
export type HistoryValue = {
    histogramTimeseries: HistorgramTimeserie[];
    percentilesTimeseries: {
        p75s: PercentileValues;
    };
};
export type DensityValue = number | "NaN";
export type Fractions = {
    fractions: DensityValue[];
};
export type FractionTimeseries = {
    [x: string]: Fractions;
};
export type FormFactorsFractionTimeseries = {
    desktop: Fractions;
    phone: Fractions;
    tablet: Fractions;
};
export type NavigationTypesFractionTimeseries = {
    back_forward_cache: Fractions;
    prerender: Fractions;
    navigate: Fractions;
    navigate_cache: Fractions;
    reload: Fractions;
    restore: Fractions;
    back_forward: Fractions;
};
export type ResourceTypesFractionTimeseries = {
    image: Fractions;
    text: Fractions;
};
export type HistoryPercentile = {
    percentilesTimeseries: {
        p75s: (number | null)[];
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
            first_contentful_paint?: HistoryValue;
            largest_contentful_paint?: HistoryValue;
            cumulative_layout_shift?: HistoryValue;
            interaction_to_next_paint?: HistoryValue;
            experimental_time_to_first_byte?: HistoryValue;
            round_trip_time?: HistoryValue;
            form_factors?: {
                fractionTimeseries: FormFactorsFractionTimeseries;
            };
            navigation_types?: {
                fractionTimeseries: NavigationTypesFractionTimeseries;
            };
            largest_contentful_paint_resource_type: {
                fractionTimeseries: ResourceTypesFractionTimeseries;
            };
            largest_contentful_paint_image_time_to_first_byte: HistoryPercentile;
            largest_contentful_paint_image_resource_load_delay: HistoryPercentile;
            largest_contentful_paint_image_resource_load_duration: HistoryPercentile;
            largest_contentful_paint_image_element_render_delay: HistoryPercentile;
        };
        collectionPeriods: CollectionPeriod[];
    };
    urlNormalizationDetails?: {
        originalUrl: string;
        normalizedUrl: string;
    };
};

import itemsjs from 'itemsjs';

interface Aggregation {
    title: string;
    conjunction?: boolean;
    hide_zero_doc_count?: boolean;
    chosen_filters_on_top?: boolean;
    show_facet_stats?: boolean;
}

interface Configuration {
    aggregations: {
        [key: string]: Aggregation;
    };
}

interface FilterParams {
    [key: string]: string | string[] | undefined;
    zone?: string | string[];
    propertyType?: string | string[];
    deadlineYear?: string | string[];
    complete?: string | string[];
    price_min?: string;
    price_max?: string;
}

interface PropertyItem {
    id?: string | number;
    title?: string;
    slug?: string;
    name?: string;
    address?: string;
    description?: string;
    image_display?: string;
    min_mortgage?: number;
    price_min?: number | string;
    price_max?: number | string;
    price?: number;
    propertyType?: string;
    zone?: string;
    complete?: boolean | string;
    deadlineYear?: number | string;
    location?: string;
}

interface FacetBucket {
    key: string;
    doc_count: number;
}

interface FacetData {
    buckets: FacetBucket[];
    facet_stats?: {
        min?: number;
        max?: number;
        avg?: number;
        sum?: number;
    };
}

interface Choice {
    label: string;
    value: string | number | boolean;
}

interface SpecRange {
    min: number;
    max: number;
}

interface SpecItem {
    name: string;
    choices?: Choice[];
    range?: SpecRange;
}

const sortingArr = ['zone', 'propertyType', 'deadlineYear', 'price_min', 'price_max', 'complete'];

const configuration: Configuration = {
    aggregations: {
        zone: {
            title: 'zone',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        propertyType: {
            title: 'propertyType',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        deadlineYear: {
            title: 'deadlineYear',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        complete: {
            title: 'complete',
            conjunction: true,
            hide_zero_doc_count: true,
            chosen_filters_on_top: false,
        },
        price: {
            title: 'price',
            show_facet_stats: true,
        },
    },
};

export const handleSortParams = (params: FilterParams): Record<string, string[]> => {
    const newParams = Object.keys(params)
        .filter((i) => params[i] !== '')
        .sort((a, b) => sortingArr.indexOf(a) - sortingArr.indexOf(b))
        .reduce((res: Record<string, string[]>, key) => {
            const value = params[key];
            res[key] = Array.isArray(value) ? value : String(value).split(',');
            return res;
        }, {});

    return newParams;
};

export const handleFlatsFilter = (array: PropertyItem[], params: FilterParams): PropertyItem[] =>
    // eslint-disable-next-line complexity
    array.filter((p) => {
        const checks: boolean[] = [];

        for (const [key, value] of Object.entries(params)) {
            if (value === '') {
                continue;
            }

            switch (key) {
                case 'price_min':
                case 'price_max':
                    if (params.price_max && params.price_min && p.price) {
                        checks.push(
                            Number(params.price_min) <= Number(p.price) &&
                                Number(p.price) <= Number(params.price_max)
                        );
                    } else if (key === 'price_min' && p.price) {
                        checks.push(Number(value) <= Number(p.price));
                    } else if (key === 'price_max' && p.price) {
                        checks.push(Number(p.price) <= Number(value));
                    }
                    break;
                default:
                    if (Array.isArray(value)) {
                        const stringValues = value.map(String);
                        checks.push(stringValues.includes(String(p[key])));
                    } else {
                        checks.push(String(p[key]) === String(value));
                    }
            }
        }

        return !checks.includes(false);
    });

// eslint-disable-next-line complexity
export const handlePrepareSpecsFacets = (
    aggregations: Record<string, FacetData>,
    facets = false
): SpecItem[] => {
    const preFacets: Record<string, any> = {};

    for (const [key, value] of Object.entries(aggregations)) {
        if (value) {
            const aggrs = value.buckets?.map((i) => i.key) || [];
            preFacets[key] = aggrs;

            if (value?.facet_stats) {
                preFacets[`${key}_min`] = value.facet_stats.min;
                preFacets[`${key}_max`] = value.facet_stats.max;
            }
        }
    }

    let zoneChoices: Choice[] = [];
    let typeChoices: Choice[] = [];
    let completeChoices: Choice[] = [];
    let deadlineChoices: Choice[] = [];

    if (!facets) {
        const zoneTypes: Record<string, string> = {
            moscow: 'Москва',
            spb: 'Санкт-Петербург',
            krasnodar: 'Краснодар',
            ekt: 'Екатеринбург',
            tula: 'Тула',
            omsk: 'Омск',
            sochi: 'Сочи',
            tomsk: 'Томск',
        };

        const propertyTypes: Record<string, string> = {
            flat: 'Квартиру',
            parking: 'Паркинг',
            storage: 'Кладовую',
        };

        const completeTypes: Record<string, string> = {
            true: 'Сдан',
            false: 'Не сдан',
        };

        zoneChoices = preFacets.zone.map((elem: string) => ({
            label: zoneTypes[elem],
            value: elem,
        }));

        typeChoices = preFacets.propertyType.map((elem: string) => ({
            label: propertyTypes[elem],
            value: elem,
        }));

        completeChoices = preFacets.complete.map((elem: string) => ({
            label: completeTypes[elem],
            value: elem,
        }));

        deadlineChoices = preFacets.deadlineYear
            .sort((a: number, b: number) => a - b)
            .map((elem: number) => ({
                label: String(elem),
                value: elem,
            }));
    }

    return [
        {
            name: 'zone',
            choices: !facets ? zoneChoices : preFacets.zone,
        },
        {
            name: 'propertyType',
            choices: !facets ? typeChoices : preFacets.propertyType,
        },
        {
            name: 'complete',
            choices: !facets ? completeChoices : preFacets.complete,
        },
        {
            name: 'deadlineYear',
            choices: !facets
                ? deadlineChoices
                : preFacets.deadlineYear.sort((a: number, b: number) => a - b),
        },
        {
            name: 'price',
            range: {
                min: preFacets.price_min || 0,
                max: preFacets.price_max || 0,
            },
        },
    ];
};

// eslint-disable-next-line complexity
export const handleFlatsSpecsFacets = (
    array: PropertyItem[],
    params: FilterParams,
    skipParams: string[] = [],
    facets = false
) => {
    let items = [...array];
    const config = { ...configuration };
    let activeParams: Record<string, string[]> = {};

    if (params) {
        activeParams = handleSortParams(params);
        delete activeParams.price_max;
        delete activeParams.price_min;
    }

    // Prefilter
    if (params.price_min || params.price_max) {
        items = handleFlatsFilter(items, {
            price_min: params?.price_min || '',
            price_max: params?.price_max || '',
        });
    }

    // Conjunction = true === AND || OR
    if (Object.keys(activeParams).length) {
        Object.keys(config.aggregations).forEach((i) => {
            if (config.aggregations[i].conjunction !== undefined) {
                config.aggregations[i].conjunction = Boolean(!activeParams[i]);
            }
        });
    }

    // Skip params for individual filters
    skipParams.forEach((param) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete activeParams[param];
    });

    const searchClient = itemsjs(items, config);
    const searchResult = searchClient.search({
        filters: activeParams,
        per_page: items.length,
    });

    return handlePrepareSpecsFacets(searchResult.data.aggregations, facets);
};

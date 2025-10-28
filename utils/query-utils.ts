export interface QueryObject {
    [key: string]: string | number | boolean | (string | number | boolean)[] | undefined;
}

export interface RouteObject {
    query: Record<string, string | string[]>;
    path: string;
}

export function objectToQuery(obj: QueryObject): string {
    let qs = '';
    for (const name in obj) {
        if (obj[name] !== undefined && obj[name] !== null && obj[name] !== '') {
            if (Array.isArray(obj[name])) {
                (obj[name] as (string | number | boolean)[]).forEach((val) => {
                    if (val !== undefined && val !== null && val !== '') {
                        qs += `${name}=${encodeURIComponent(String(val))}&`;
                    }
                });
            } else {
                qs += `${name}=${encodeURIComponent(String(obj[name]))}&`;
            }
        }
    }
    return qs.slice(0, -1);
}

// eslint-disable-next-line complexity
export function applyQuery(
    defaultValues: QueryObject,
    queryValues: Record<string, string | string[]>
): QueryObject {
    const values = { ...defaultValues };

    if (typeof defaultValues !== 'object') {
        console.warn('defaultValues must be an object');
        return values;
    }
    if (typeof queryValues !== 'object') {
        console.warn('queryValues must be an object');
        return values;
    }
    if (!Object.keys(queryValues).length) {
        return values;
    }

    for (const name in queryValues) {
        if (Object.prototype.hasOwnProperty.call(values, name)) {
            const defaultValue = values[name];
            const queryValue = queryValues[name];

            if (Array.isArray(defaultValue)) {
                if (Array.isArray(queryValue)) {
                    values[name] = queryValue.map((i) => {
                        if (i === 'true') return true;
                        if (i === 'false') return false;
                        const numValue = Number(i);
                        return isNaN(numValue) ? i : numValue;
                    });
                } else {
                    const convertedValue =
                        queryValue === 'true'
                            ? true
                            : queryValue === 'false'
                              ? false
                              : !isNaN(Number(queryValue))
                                ? Number(queryValue)
                                : queryValue;
                    values[name] = [convertedValue];
                }
            } else if (Array.isArray(queryValue)) {
                const firstValue = queryValue[0];
                values[name] =
                    firstValue === 'true'
                        ? true
                        : firstValue === 'false'
                          ? false
                          : !isNaN(Number(firstValue))
                            ? Number(firstValue)
                            : firstValue;
            } else {
                values[name] =
                    queryValue === 'true'
                        ? true
                        : queryValue === 'false'
                          ? false
                          : !isNaN(Number(queryValue))
                            ? Number(queryValue)
                            : queryValue;
            }
        }
    }

    return values;
}

export function updateQuery(
    values: QueryObject,
    route: RouteObject,
    utmTags: string[] = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        '_openstat',
        'yclid',
        'calltouch_tm',
    ]
): void {
    let result: QueryObject;

    if (Object.keys(route.query).length) {
        const utmQuery = Object.fromEntries(
            Object.entries(route.query).filter(([key]) => utmTags.includes(key))
        );
        result = { ...values, ...utmQuery };
    } else {
        result = { ...values };
    }

    const urlQuery = objectToQuery(result);
    if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(
            null,
            '',
            `${route.path}${urlQuery?.length ? `?${urlQuery}` : ''}`
        );
    }
}

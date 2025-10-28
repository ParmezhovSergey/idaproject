interface SpecChoice {
    key: string;
    doc_count?: number;
}

interface SpecRange {
    min: number;
    max: number;
}

interface Spec {
    name: string;
    choices?: SpecChoice[];
    ranges?: SpecRange[];
    range?: SpecRange;
}

interface PreparedSpecs {
    [key: string]: SpecChoice[] | SpecRange[] | SpecRange;
}

export function prepareSpecs(arr: any): PreparedSpecs {
    if (!Array.isArray(arr)) {
        console.warn('[prepareSpecs] Specs response is not an Array! Got ' + arr);
        return {};
    }

    const specs: PreparedSpecs = {};
    arr.forEach((spec: Spec) => {
        specs[spec.name] = spec.choices
            ? spec.choices
            : spec.ranges
              ? spec.ranges
              : spec.range || [];
    });
    return specs;
}

export type { SpecChoice, SpecRange, Spec, PreparedSpecs };

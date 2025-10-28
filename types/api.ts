export interface ProjectsApi {
    projects: {
        slug: (slug: string) => string;
        buildings: (slug: string) => string;
        list: string;
        specs: string;
        facets: string;
    };
}

export interface FlatsApi {
    floors: {
        id: (id: string | number) => string;
        flats: (id: string | number) => string;
    };
}

export interface ApiConfig extends ProjectsApi, FlatsApi {}

export interface Project {
    id: string | number;
    title: string;
    slug: string;
    name?: string;
    address?: string;
    description?: string;
    image_display?: string;
    min_mortgage?: number;
    price_min?: number;
    price_max?: number;
    price?: number;
    propertyType?: string;
    zone?: string;
    complete?: boolean | string;
    deadlineYear?: number | string;
    location?: string;
    // Add other project properties as needed
}

export interface FilterValues {
    propertyType: string;
    zone: string;
    complete: string | boolean;
    price_max: string;
    price_min: string;
    deadlineYear: string;
}

interface Range {
    min: number;
    max: number;
}

type ArraySpec = string[] | number[] | boolean[];

export interface FilterSpecs {
    price: Range;
    [key: string]: ArraySpec | Range;
}

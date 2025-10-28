import { handleFlatsFilter } from '~/utils/mock-utils';
import { projectsData } from '~/utils/mock-data';

// Using shared mock data

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    try {
        // Filter items based on query parameters
        const filteredItems =
            Object.keys(query).length > 0
                ? handleFlatsFilter(projectsData, query as any)
                : projectsData;

        return {
            success: true,
            data: {
                items: filteredItems,
                total: filteredItems.length,
            },
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `${error}: Failed to fetch projects data`,
        });
    }
});

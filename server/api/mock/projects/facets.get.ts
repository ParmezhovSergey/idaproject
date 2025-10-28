import { handleFlatsSpecsFacets } from '~/utils/mock-utils';
import { projectsData } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    try {
        const facets = handleFlatsSpecsFacets(projectsData, query as any, [], true);

        return {
            success: true,
            data: facets,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `${error}: Failed to fetch facets data`,
        });
    }
});

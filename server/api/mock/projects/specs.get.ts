import { handleFlatsSpecsFacets } from '~/utils/mock-utils';
import { projectsData } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    try {
        const specs = handleFlatsSpecsFacets(projectsData, query as any, [], false);

        return {
            success: true,
            data: specs,
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `${error}: Failed to fetch specs data`,
        });
    }
});

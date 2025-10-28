<script setup lang="ts">
    // #region Imports
    // Utils
    import { applyQuery, updateQuery } from '~/utils/query-utils';
    import { prepareSpecs } from '~/utils/filter-utils';

    // Components
    import ProjectsSelector from '~/components/projects/ProjectsSelector.vue';
    import ProjectCard from '~/components/projects/ProjectCard.vue';
    import ProjectsLoader from '~/components/projects/ProjectsLoader.vue';
    import { gsap } from 'gsap';
    // #endregion

    // #region Data
    const $style = useCssModule();

    // Constants
    const defaultValues = {
        propertyType: '',
        zone: '',
        complete: '',
        price_max: '',
        price_min: '',
        deadlineYear: '',
    };

    // Update specs by keys
    const arrUpdateSpecs = ['zone', 'propertyType'];

    // Reset values by keys
    const arrResetValues = ['zone'];

    // Reactive state
    const specs = ref({});
    const facets = ref({});
    const items = ref([]);
    const values = ref({ ...defaultValues });
    const counter = ref(0);
    const isReloadActive = ref(true);
    const view = ref('list');

    // Animated counter value
    const displayCounter = ref(counter.value);
    watch(counter, (newVal, oldVal) => {
        const obj = { value: oldVal };
        gsap.to(obj, {
            value: newVal,
            duration: 0.5,
            ease: 'power1.out',
            onUpdate: () => {
                displayCounter.value = Math.round(obj.value);
            },
        });
    });

    // Composables
    const route = useRoute();

    // Initial data fetch
    // eslint-disable-next-line complexity
    const { data: initialData } = await useAsyncData(`projects-page-${route.query}`, async () => {
        // Предфильтрация доступных параметров
        const queryValues = Object.fromEntries(
            Object.entries(route.query).filter(([key]) => Object.keys(defaultValues).includes(key))
        );

        const queryParams = applyQuery(defaultValues, queryValues);

        // TODO: 1. необходимо настроить получение данных для списка карточек с backend
        try {
            const [specsRes, facetsRes, projectsRes] = await Promise.all([
                // Фильтруем спеки, для query
                $fetch('/api/mock/projects/specs', {
                    params: Object.fromEntries(
                        Object.entries(queryParams).filter(([key]) => arrUpdateSpecs.includes(key))
                    ),
                }),

                $fetch('/api/mock/projects/facets', {
                    params: queryParams,
                }),

                $fetch('/api/mock/projects', {
                    params: queryParams,
                }),
            ]);
            // const projectsRes = { data: { items: [], total: 0 } };

            // Extract data from mock API response structure
            // const projectsData = (projectsRes?.data as { items: any[]; total: number }) || {
            //     items: [],
            //     total: 0,
            // };
            const specsData = specsRes?.data || [];
            const facetsData = facetsRes?.data || [];
            const projectsData = projectsRes?.data || { items: [], total: 0 };

            return {
                items: projectsData.items || [],
                facets: prepareSpecs(facetsData) || {},
                specs: prepareSpecs(specsData) || {},
                counter: projectsData.total || 0,
                values: queryParams,
            };
        } catch (err) {
            console.warn('[MainPage/useAsyncData] request failed: ', err);
            return {
                items: [],
                facets: {},
                specs: {},
                counter: 0,
                values: defaultValues,
            };
        }
    });

    // Initialize reactive state with fetched data
    if (initialData.value) {
        specs.value = initialData.value.specs;
        facets.value = initialData.value.facets;
        items.value = initialData.value.items;
        values.value = initialData.value.values as typeof defaultValues;
        counter.value = initialData.value.counter;
    }
    // #endregion

    // #region Computed
    const isShowReset = computed(() => {
        return Object.keys(values.value).some(
            (key) => values.value[key] !== defaultValues[key] && values.value[key] !== ''
        );
    });
    // #endregion

    // #region Methods
    // TODO: 2. необходимо настроить получение новых данных, при обновлении фильтра
    const handleFetchItems = async (): Promise<{ items: any[]; total: number }> => {
        try {
            const res = await $fetch('/api/mock/projects', {
                method: 'GET',
                params: values.value,
            });
            return res.data || { items: [], total: 0 };
        } catch (err) {
            console.error('[projectsPage/handleFetchItems]', err);
            return { items: [], total: 0 };
        }
    };

    const handleFetchSpecs = async () => {
        try {
            const resp = await $fetch('/api/mock/projects/specs', {
                params: values.value,
            });
            return resp?.data || [];
        } catch (err) {
            console.warn('[projectsPage/handleFetchSpecs] request failed: ', err);
            return [];
        }
    };

    const handleFetchFacets = async () => {
        try {
            const resp = await $fetch('/api/mock/projects/facets', {
                params: values.value,
            });
            return resp?.data || [];
        } catch (err) {
            console.warn('[projectsPage/handleFetchFacets] request failed: ', err);
            return [];
        }
    };

    const handleUpdateItems = async (updateSpecs = false) => {
        isReloadActive.value = true;
        const start = Date.now();

        const [projectsRes, facetsRes] = await Promise.all([
            handleFetchItems(),
            handleFetchFacets(),
            handleFetchItems(),
        ]);

        if (updateSpecs) {
            const specsRes = await handleFetchSpecs();
            specs.value = prepareSpecs(specsRes) || [];
        }

        items.value = projectsRes?.items || [];
        counter.value = projectsRes?.total || 0;
        facets.value = prepareSpecs(facetsRes) || [];

        const longLoad = Date.now() - start > 600;

        setTimeout(
            () => {
                nextTick(() => {
                    isReloadActive.value = false;
                    updateQuery(values.value, route);
                });
            },
            longLoad ? 0 : 600
        );
    };

    const handleReset = async () => {
        values.value = { ...defaultValues };
        await handleUpdateItems(true);
    };

    const onFilterChange = async (val) => {
        if (val === 'reset') {
            await handleReset();
            return;
        }

        const valueKey = Object.keys(val.value)[0];

        // Проверка, требуется ли обновлять specs
        const isUpdateSpecs =
            arrUpdateSpecs.includes(valueKey) || arrResetValues.includes(valueKey);

        // Сбрасываем values до дефолтовых, если требуется
        if (arrResetValues.includes(valueKey)) {
            values.value = { ...defaultValues, ...val.value };
        } else {
            values.value = { ...values.value, ...val.value };
        }

        // Удаляем ненужные параметры на условие
        if (values.value.complete && values.value.propertyType !== 'flat') {
            values.value.complete = '';
        }

        await handleUpdateItems(isUpdateSpecs);
    };

    // #region Computed
    // TODO: 3. необходимо распарсить данные для карточки компонента ProjectCard
    const parsedItems = computed(() => {
        return items.value.map((item) => ({
            id: item.id,
            address: item.address,
            name: item.name,
            price: item.price,
            image_display: item.image_display,
        }));
    });
    // #endregion

    // #region Lifecycle
    onMounted(() => {
        setTimeout(() => {
            isReloadActive.value = false;
        }, 600);
    });
    // #endregion
</script>

<template>
    <div :class="['page', $style.ProjectsFilterPage]">
        <div class="container">
            <h1 :class="$style.counter">
                Проекты
                <span>{{ displayCounter }}</span>
            </h1>

            <ProjectsSelector
                v-if="
                    Object.keys(facets).length &&
                    Object.keys(specs).length &&
                    Object.keys(values).length
                "
                :facets="facets"
                :show-reset-btn="isShowReset"
                :specs="specs"
                :values="values"
                @change="onFilterChange"
            />

            <div
                v-if="items && items.length"
                :class="[$style.projectsWrapper, { [$style._reload]: isReloadActive }]"
            >
                <!-- Список проектов по фильтру -->
                <div :class="[$style.projectsList, { [$style._reload]: isReloadActive }]">
                    <ProjectCard
                        v-for="(project, index) in parsedItems"
                        :key="`${index}_project`"
                        :project="project"
                    />
                </div>

                <!-- Loader -->
                <transition
                    mode="in-out"
                    name="fade-fast"
                >
                    <div
                        v-if="view === 'list' && isReloadActive"
                        :class="$style.listWrapper"
                    >
                        <ProjectsLoader />
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<style lang="scss" module>
    .ProjectsFilterPage {
        //
    }

    .counter {
        margin-top: 6.4rem;
        margin-bottom: 3.2rem;
        text-transform: uppercase;
        font-family: $additional-font;
        font-size: 4rem;
        font-weight: 600;

        span {
            color: $violet;
        }
    }

    .projectsWrapper {
        position: relative;
        margin: 3.2rem 0;
        padding-bottom: 6.4rem;

        &._reload {
            min-height: calc(100vh + 3.2rem);

            @include respond-to(mobile) {
                min-height: calc(135vh + 3.2rem);
            }
        }
    }

    .listWrapper {
        position: absolute;
        top: 0.8rem;
        left: 0;
        width: 100%;
        height: 100%;

        @include respond-to(tablet) {
            top: 0;
        }
    }

    .projectsList {
        display: flex;
        flex-flow: row wrap;
        margin: -0.8rem;
        padding-top: 1.6rem;
        opacity: 1;

        /* отключаем переход по ссылке, для демки */
        pointer-events: auto;

        @include respond-to(tablet) {
            margin: 0 0 2.4rem;
            padding: 0;
        }

        &._reload {
            opacity: 0;
        }
    }
</style>

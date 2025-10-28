<script setup lang="ts">
    // #region Imports
    // Types
    import type { FilterValues, FilterSpecs } from '~/types/api';
    // #endregion

    // #region Interfaces
    interface Props {
        values: FilterValues;
        specs: Partial<FilterSpecs>;
        facets: Partial<FilterSpecs>;
        showResetBtn?: boolean;
    }

    interface Emits {
        change: [event: Record<string, any> | 'reset'];
        'open-modal': [];
    }
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<Props>(), {
        showResetBtn: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits<Emits>();
    // #endregion

    // #region Data
    const $style = useCssModule();
    // #endregion

    // #region Computed
    const isCompleteDisabled = computed(() => {
        const c = props.facets.complete;
        if (!Array.isArray(c)) return true;
        return !(c as string[]).includes('true');
    });
    // #endregion

    // #region Methods
    const handleFilterChange = (value: string | number | (string | number)[]) => {
        emit('change', { value });
    };

    const handleReset = () => {
        emit('change', 'reset');
    };
    // #endregion
</script>

<template>
    <div :class="$style.ProjectsSelector">
        <div :class="$style.row">
            <div
                v-if="Array.isArray(specs?.zone) && Array.isArray(facets?.zone)"
                :class="$style.filterItem"
            >
                <div :class="$style.filterTitle">Город</div>

                <VSelect
                    name="zone"
                    :value="values.zone"
                    :specs="specs.zone"
                    :facets="facets.zone"
                    placeholder="Все"
                    @change="handleFilterChange"
                />
            </div>

            <div
                v-if="Array.isArray(specs?.propertyType) && Array.isArray(facets?.propertyType)"
                :class="$style.filterItem"
            >
                <div :class="$style.filterTitle">Тип недвижимости</div>

                <VSelect
                    name="propertyType"
                    :value="values.propertyType"
                    :specs="specs.propertyType"
                    :facets="facets.propertyType"
                    placeholder="Все"
                    @change="handleFilterChange"
                />
            </div>

            <div
                v-if="Array.isArray(specs?.deadlineYear) && Array.isArray(facets?.deadlineYear)"
                :class="$style.filterItem"
            >
                <div :class="$style.filterTitle">Срок сдачи</div>

                <VSelect
                    name="deadlineYear"
                    :value="values.deadlineYear"
                    :specs="specs.deadlineYear"
                    :facets="facets.deadlineYear"
                    multiple
                    placeholder="Все"
                    @change="handleFilterChange"
                />
            </div>

            <div
                v-if="typeof specs?.price === 'object' && specs?.price?.min && specs?.price?.max"
                :class="$style.filterItem"
            >
                <div :class="$style.filterTitle">Цена</div>

                <VRange
                    :name="['price_min', 'price_max']"
                    :specs="specs.price"
                    :facets="facets.price"
                    :value-min="values.price_min"
                    :value-max="values.price_max"
                    postfix="<span class='rub'>Р</span>"
                    show-label
                    @change="handleFilterChange"
                />
            </div>
        </div>

        <div :class="$style.row">
            <transition name="fade">
                <VButton
                    v-show="values.propertyType === 'flat'"
                    :active="values.complete === 'true'"
                    :class="[$style.filterButton, $style._desktop]"
                    :disabled="isCompleteDisabled"
                    border
                    round
                    @click="
                        $emit('change', {
                            value: { complete: values.complete === 'true' ? 'false' : 'true' },
                        })
                    "
                >
                    Готовые квартиры
                </VButton>
            </transition>

            <div :class="[$style.resetBtn, { [$style._disabled]: !props.showResetBtn }]">
                <span @click="handleReset">
                    Очистить фильтр
                    <Icon
                        :class="$style.resetIcon"
                        name="icons:refresh"
                    />
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" module>
    .ProjectsSelector {
        user-select: none;
    }

    .row {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        user-select: none;

        &:last-child {
            align-items: center;
            min-height: 5.2rem;
            margin-top: 3.2rem;

            @include respond-to(tablet) {
                display: flex;
            }

            @include respond-to(mobile) {
                display: block;
            }
        }

        @include respond-to(tablet) {
            display: block;
        }
    }

    .filterItem {
        flex: 1;
        margin-right: 2rem;

        &:last-child {
            margin-right: 0;
        }

        @include respond-to(tablet) {
            margin-top: 2rem;
            margin-right: 0;

            &:first-child {
                margin-top: 0;
            }
        }
    }

    .filterTitle {
        display: block;
        margin-bottom: 1.2rem;
        font-size: 1.2rem;
        line-height: 1;
        letter-spacing: -0.005em;
        color: #9197a6;
    }

    .resetBtn {
        position: absolute;
        visibility: visible;
        display: flex;
        justify-content: center;
        width: 100%;
        transition: all ease 0.3s;
        pointer-events: none;

        &._disabled {
            opacity: 0.3;

            span {
                cursor: default;
                pointer-events: none;
            }
        }

        span {
            display: flex;
            align-items: center;
            text-transform: capitalize;
            line-height: 1.2;
            transition: opacity 0.3s;
            cursor: pointer;
            user-select: none;
            pointer-events: all;

            &:hover {
                opacity: 0.7;
            }
        }

        .resetIcon {
            width: 1.6rem;
            height: 1.6rem;
            margin-left: 0.4rem;
        }

        @include respond-to(mobile) {
            position: relative;
            margin-top: 2rem;
        }
    }
</style>

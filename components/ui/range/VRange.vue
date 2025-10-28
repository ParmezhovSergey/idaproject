<script setup lang="ts">
    // #region Imports
    // Utils
    import { splitThousands } from '~/utils/numbers-utils';

    // Types
    import type { IRangeProps } from './types';

    // Components
    import VInputThousands from '../input/VInputThousands.vue';
    import VRangeSlider from './VRangeSlider.vue';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IRangeProps>(), {
        size: 'medium',
        color: 'base',
        postfix: '',
        showLabel: false,
        labels: () => ['от', 'до'],
        specs: () => ({ min: 1, max: 100 }),
        facets: () => ({}),
        step: 1,
        valueMin: '',
        valueMax: '',
        single: false,
        positiveOnly: true,
        disabled: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['change']);
    // #endregion

    // #region Data
    const $style = useCssModule();

    const minRef = ref(null);
    const placeholderRef = ref<HTMLElement | null>(null);
    const minPlaceholderRef = ref<HTMLElement | null>(null);
    const maxPlaceholderRef = ref<HTMLElement | null>(null);

    const lazyValue = ref([
        props.valueMin ? props.valueMin : props.specs.min,
        props.valueMax ? props.valueMax : props.specs.max,
    ]);

    const oldValues = ref([
        props.valueMin ? props.valueMin : props.specs.min,
        props.valueMax ? props.valueMax : props.specs.max,
    ]);

    const placeholderWidth = reactive({
        first: null as number | null,
        second: null as number | null,
    });
    const placeholderVals = reactive({
        first: null as string | number | null,
        second: null as string | number | null,
    });
    const resizeObserver = ref<ResizeObserver | null>(null);
    // #endregion

    // #region Methods
    const splitThousandsExport = splitThousands;

    /**
     * Обновляет значение lazyValues компонента, при изменении передаваемых пропсов
     * @public
     */
    const applyValues = () => {
        const min = props.valueMin ? props.valueMin : `${props.facets.min}`;
        const max = props.valueMax ? props.valueMax : `${props.facets.max}`;
        lazyValue.value = ['', ''];
        nextTick(() => {
            lazyValue.value = [min, max];
            oldValues.value = [min, max];
        });
    };

    /**
     * Для корректной работы ResizeObserver, позволяет задать
     * размер плейсхолдера, для корректной работы postfix
     * @public
     */
    const getPlaceholderWidth = () => {
        placeholderWidth.first = minPlaceholderRef.value?.offsetWidth || null;

        if (!props.single) {
            placeholderWidth.second = maxPlaceholderRef.value?.offsetWidth || null;
        }
    };

    /**
     * Вызывается из watch facets, чтобы изменить значение рейнджей и инпута,
     * после выполнения запроса в backend.
     * Только в случае, если не заданы valueMin и valueMax
     * @public
     */
    const applyfacets = () => {
        if (props.facets.min && props.facets.max && !props.valueMin && !props.valueMax) {
            lazyValue.value = ['', ''];
            nextTick(() => {
                lazyValue.value = [props.facets.min, props.facets.max];
                oldValues.value = [props.facets.min, props.facets.max];
            });
        } else {
            console.warn('Something wrong with range facets');
        }
    };

    /**
     * Вызывается из watch specks, чтобы изменить значение рейнджей и инпута,
     * после выполнения запроса в backend.
     * Только в случае, если не заданы valueMin и valueMax
     * @public
     */
    const applySpecs = () => {
        lazyValue.value = [props.specs.min, props.specs.max];
        oldValues.value = [props.specs.min, props.specs.max];
    };

    /**
     * Вызывается после ручного введения данных, через инпут.
     * Позволяет задать размер плейсхолдера, для корректной работы postfix
     * @param {Number} val Значение
     * @param {String} handler Ключ объекта placeholderVals
     * @public
     */
    const onInput = (val, handler) => {
        if (placeholderVals[handler] !== val) {
            placeholderVals[handler] = val;
        }
    };

    /**
     * Эмитит новые значения в родительский компонент,
     * для передачи в запрос фильтра
     * @returns {Object} values Объект с ключами из name
     * @public
     */
    // eslint-disable-next-line complexity
    const emitChange = () => {
        let [minValue, maxValue] = lazyValue.value;

        // Не изменяем значения автоматически на границы, позволяем пользователю выбирать точные значения
        // Только проверяем, что значения в допустимом диапазоне
        minValue = Math.max(props.specs.min, Math.min(props.specs.max, Number(minValue)));

        if (!props.single) {
            maxValue = Math.max(props.specs.min, Math.min(props.specs.max, Number(maxValue)));
        }

        let name: string | string[];

        if (props.single) {
            name = Array.isArray(props.name) ? props.name[0] : props.name;
        } else if (Array.isArray(props.name)) {
            name = [...props.name];
        } else {
            name = [`${props.name}Min`, `${props.name}Max`];
        }

        // Обновляем lazyValue только если значения действительно изменились
        const newValues = [minValue, maxValue];
        if (JSON.stringify(lazyValue.value) !== JSON.stringify(newValues)) {
            lazyValue.value = newValues;
        }

        if (JSON.stringify(newValues) !== JSON.stringify(oldValues.value)) {
            oldValues.value = newValues;

            let emitData: Record<string, string>;

            if (props.single) {
                const singleName = typeof name === 'string' ? name : name[0];
                emitData = {
                    [singleName]: minValue === null ? '0' : minValue.toString(),
                };
            } else {
                const nameArray = Array.isArray(name) ? name : [name];
                emitData = {
                    [nameArray[0]]: minValue === null ? '0' : minValue.toString(),
                    [nameArray[1]]: maxValue === null ? '0' : maxValue.toString(),
                };
            }

            /**
             * Отдаёт выбранные пользователем значения
             * @event change
             * @param {Object} emitData Объект с ключами из name
             */
            emit('change', emitData);
        }
    };

    /**
     * Вызывается после ручного введения данных, через инпут.
     * Сохраняет новые значения в lazyValue.
     * Необходимо для решения проблем реактивности.
     * @param {Number} val Значение
     * @param {String} handler Для определения min или max изменений
     * @public
     */
    // eslint-disable-next-line complexity
    const onInputChange = (val, handler) => {
        const isDifferentVal = val !== lazyValue.value[handler === 'first' ? 0 : 1];
        const isGreaterVal = val > lazyValue.value[1];
        const isSmallerVal = val < lazyValue.value[0];

        if (props.single && handler === 'first' && isDifferentVal) {
            lazyValue.value[0] = val;
        } else if (handler === 'first' && isDifferentVal) {
            lazyValue.value = isGreaterVal ? [lazyValue.value[1], val] : [val, lazyValue.value[1]];
        } else if (handler === 'second' && isDifferentVal) {
            lazyValue.value = isSmallerVal ? [val, lazyValue.value[0]] : [lazyValue.value[0], val];
        } else {
            placeholderVals[handler] = val;
        }

        if (isDifferentVal) {
            nextTick(() => {
                emitChange();
            });
        }
    };
    // #endregion

    // #region Computed
    const classList = computed(() => [
        {
            [$style[`_${props.color}`]]: props.color,
            [$style[`_${props.size}`]]: props.size,
            [$style._disabled]: props.disabled,
        },
    ]);

    const inputsLength = computed(() => ({
        maxlength: splitThousands(props.specs.max).length,
        minlength: splitThousands(props.specs.min).length,
    }));

    const inputsStyle = computed(() => {
        if (!props.postfix || (props.postfix && placeholderWidth.first)) {
            return { visibility: 'visible' as const, opacity: 1 };
        } else {
            return { visibility: 'hidden' as const };
        }
    });

    const getStylesMin = computed(() => {
        if (!props.postfix || !placeholderWidth.first) {
            return;
        }
        return { width: `${placeholderWidth.first}px` };
    });

    const getStylesMax = computed(() => {
        if (props.single || !props.postfix || !placeholderWidth.second) {
            return;
        }

        return { width: `${placeholderWidth.second}px` };
    });

    const isValuesChange = computed(() => `${props.valueMin}|${props.valueMax}`);
    // #endregion

    // Watchers
    watch(
        () => props.facets,
        () => {
            if (!props.single && !props.valueMin && !props.valueMax) {
                applyfacets();
            }
        }
    );

    watch(
        () => props.specs,
        () => {
            if (!props.valueMin && !props.valueMax) {
                applySpecs();
            }
        }
    );

    watch(
        lazyValue,
        (val) => {
            if (!props.postfix) {
                return;
            }

            if (props.single) {
                placeholderVals.first = val[0];
                return;
            }

            [placeholderVals.first, placeholderVals.second] = [...val];
        },
        { deep: true }
    );

    watch(isValuesChange, () => {
        applyValues();
    });

    onMounted(() => {
        const min = props.valueMin ? props.valueMin : props.facets.min;

        if (props.single) {
            lazyValue.value = [min, ''];
            oldValues.value = [min, ''];
            return;
        }

        if (props.facets?.min && props.facets?.max) {
            const max = props.valueMax ? props.valueMax : props.facets.max;
            lazyValue.value = [min, max];
            oldValues.value = [min, max];
        }

        if (props.postfix && placeholderRef.value) {
            resizeObserver.value = new ResizeObserver(getPlaceholderWidth);
            resizeObserver.value.observe(placeholderRef.value);

            nextTick(() => {
                getPlaceholderWidth();
            });
        }
    });

    onBeforeUnmount(() => {
        if (props.postfix && resizeObserver.value && placeholderRef.value) {
            resizeObserver.value.unobserve(placeholderRef.value);
            resizeObserver.value = null;
            placeholderWidth.first = null;
            placeholderWidth.second = null;
        }
    });

    // Make splitThousands available in template
    defineExpose({
        splitThousands: splitThousandsExport,
    });
</script>

<template>
    <div :class="[$style.VRange, classList]">
        <div
            :style="inputsStyle"
            :class="$style.inputs"
        >
            <div :class="$style.inputWrapper">
                <div
                    v-if="showLabel && !single"
                    :class="$style.label"
                >
                    {{ labels[0] }}
                </div>

                <VInputThousands
                    ref="minRef"
                    :value="lazyValue[0]"
                    :name="
                        single
                            ? typeof name === 'string'
                                ? name.substring(0, name.length - 3)
                                : name[0]
                            : Array.isArray(name)
                              ? name[0]
                              : name
                    "
                    :color="color"
                    :size="size"
                    :style="getStylesMin"
                    :class="$style.input"
                    :positive-only="positiveOnly"
                    :length="inputsLength"
                    @input="onInput($event, 'first')"
                    @change="onInputChange($event, 'first')"
                />

                <div
                    v-if="postfix"
                    :class="$style.postfix"
                    v-html="postfix"
                ></div>
            </div>

            <div
                v-if="!single"
                :class="$style.inputWrapper"
            >
                <div
                    v-if="showLabel"
                    :class="$style.label"
                >
                    {{ labels[1] }}
                </div>

                <VInputThousands
                    :value="lazyValue[1]"
                    :name="name[1]"
                    :color="color"
                    :size="size"
                    :style="getStylesMax"
                    :class="$style.input"
                    :positive-only="positiveOnly"
                    :length="inputsLength"
                    @input="onInput($event, 'second')"
                    @change="onInputChange($event, 'second')"
                />

                <div
                    v-if="postfix"
                    :class="$style.postfix"
                    v-html="postfix"
                ></div>
            </div>
        </div>

        <VRangeSlider
            v-if="single"
            :model-value="Number(lazyValue[0])"
            :min="specs.min"
            :max="specs.max"
            :step="step"
            @update:model-value="
                (val) => {
                    lazyValue[0] = val;
                    nextTick(() => {
                        emitChange();
                    });
                }
            "
        />

        <VRangeSlider
            v-else
            :model-value="lazyValue.map((v) => Number(v))"
            :color="color"
            :min="specs.min"
            :max="specs.max"
            :step="step"
            range
            @update:model-value="
                (val) => {
                    lazyValue = val;
                    nextTick(() => {
                        emitChange();
                    });
                }
            "
        />

        <div
            v-if="postfix"
            ref="placeholderRef"
            :class="$style.placeholder"
        >
            <span
                ref="minPlaceholderRef"
                v-html="`${splitThousands(placeholderVals.first || 0)}`"
            ></span>

            <span
                v-if="!single"
                ref="maxPlaceholderRef"
                v-html="`${splitThousands(placeholderVals.second || 0)}`"
            ></span>
        </div>
    </div>
</template>

<style lang="scss" module>
    $grey-light-color: $grey-middle;
    $grey-color: $grey;

    .VRange {
        display: flex;
        flex-direction: column;
        font-size: 1.6rem;

        /* Sizes */
        &._small {
            .label {
                margin-right: 0.2rem;
            }

            .inputWrapper {
                font-size: 1.4rem;
                line-height: 1;
            }

            .postfix {
                margin-left: 0.2rem;
            }

            .inputs {
                padding-bottom: 1rem;
            }
        }

        &._medium {
            .inputWrapper {
                font-size: 1.6rem;
                line-height: 1;
            }

            .label {
                margin-right: 0.4rem;
            }

            .postfix {
                margin-left: 0.4rem;
            }

            .inputs {
                padding-bottom: 0.2rem;
            }
        }

        /* Colors */
        &._base {
            .postfix,
            .label {
                color: $grey-color;
            }
        }

        &._dark {
            .postfix,
            .label {
                color: $grey-light-color;
            }
        }

        /* Modificators */
        &._disabled {
            opacity: 0.5;
            pointer-events: none;

            select.nativeSelect {
                pointer-events: none;
            }
        }

        .input {
            &:global(.v-input) {
                width: 50%;
                padding-top: 0;
                font-size: inherit;
            }

            :global(.v-input__native) {
                width: 100%;
                padding-bottom: 0;
            }
        }
    }

    .inputs {
        visibility: hidden;
        display: flex;
        justify-content: space-between;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .inputWrapper {
        display: inline-flex;
        align-items: center;
        width: auto;

        &:last-child {
            justify-content: right;
        }
    }

    .postfix,
    .label {
        cursor: default;
        user-select: none;
    }

    .placeholder {
        position: absolute;
        z-index: -1;
        visibility: hidden;
        font-size: inherit;
        letter-spacing: initial;
        cursor: default;
    }
</style>

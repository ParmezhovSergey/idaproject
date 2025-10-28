<script setup lang="ts">
    // #region Imports
    // Utils
    import { splitThousands } from '~/utils/numbers-utils';

    // Types
    import type { IRangeSliderProps } from './types';

    // Components
    import VRangeSliderDot from './VRangeSliderDot.vue';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IRangeSliderProps>(), {
        min: 0,
        max: 100,
        step: 1,
        modelValue: 0,
        range: false,
        height: '',
        disabled: false,
        showStops: false,
        showValue: false,
        valueFormat: splitThousands,
        marks: () => ({}),
        noTransition: false,
        color: 'base',
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['update:modelValue', 'change', 'dragstart', 'dragend']);
    // #endregion

    // #region Data
    const $style = useCssModule();

    const railRef = ref<HTMLElement | null>(null);
    const dot1Ref = ref<InstanceType<typeof VRangeSliderDot> | null>(null);
    const dot2Ref = ref<InstanceType<typeof VRangeSliderDot> | null>(null);

    const firstValue = ref<number>(0);
    const secondValue = ref<number>(0);
    const oldValue = ref<number | number[] | null>(null);
    const dragging = ref(false);
    const sliderSize = ref(1);
    const focusDotIndex = ref<number | null>(null);
    const resizeObserver = ref<ResizeObserver | null>(null);
    // #endregion

    // #region Methods
    const setValues = () => {
        if (props.range) {
            if (Array.isArray(props.modelValue)) {
                firstValue.value = Math.max(
                    props.min,
                    Math.min(props.max, props.modelValue[0] || props.min)
                );
                secondValue.value = Math.max(
                    props.min,
                    Math.min(props.max, props.modelValue[1] || props.max)
                );
            }
        } else {
            if (typeof props.modelValue === 'number') {
                firstValue.value = Math.max(props.min, Math.min(props.max, props.modelValue));
            }
        }
    };

    const emitChange = () => {
        nextTick(() => {
            const newValue = props.range ? [firstValue.value, secondValue.value] : firstValue.value;

            if (JSON.stringify(newValue) !== JSON.stringify(oldValue.value)) {
                emit('update:modelValue', newValue);
                emit('change', newValue);
                oldValue.value = newValue;
            }
        });
    };

    //
    // Определяет размер слайдера
    //
    const resetSize = () => {
        if (railRef.value) {
            sliderSize.value = railRef.value['clientWidth'];
        }
    };

    //
    // Устанавливает позицию на основе события
    //
    const setPosition = (e: MouseEvent) => {
        const sliderOffsetLeft = railRef.value!.getBoundingClientRect().left;
        const position = ((e.clientX - sliderOffsetLeft) / sliderSize.value) * 100;

        const newValue =
            Math.round((position * (props.max - props.min)) / 100 / props.step) * props.step +
            props.min;
        const clampedValue = Math.max(props.min, Math.min(props.max, newValue));

        if (props.range) {
            // Определяем, к какой точке ближе
            const distanceToFirst = Math.abs(clampedValue - firstValue.value);
            const distanceToSecond = Math.abs(clampedValue - secondValue.value);

            if (distanceToFirst <= distanceToSecond) {
                firstValue.value = clampedValue;
            } else {
                secondValue.value = clampedValue;
            }
        } else {
            firstValue.value = clampedValue;
        }
    };

    //
    // Обработчик клика по рельсе
    //
    const onRailClick = (e: MouseEvent) => {
        if (props.disabled || !railRef.value) {
            return;
        }

        resetSize();
        setPosition(e);
        emitChange();
    };

    //
    // Обработчики событий перетаскивания
    //
    const onDragStart = (index: number) => {
        dragging.value = true;
        focusDotIndex.value = index;
        emit('dragstart');
    };

    const onDragEnd = () => {
        dragging.value = false;
        focusDotIndex.value = null;
        emit('dragend');
        nextTick(() => {
            emitChange();
        });
    };

    // Отслеживание изменений modelValue
    watch(
        () => props.modelValue,
        () => {
            setValues();
        },
        { deep: true }
    );
    // #endregion

    // #region Computed
    const classList = computed(() => [
        {
            [$style[`_${props.color}`]]: props.color,
            [$style._disabled]: props.disabled,
            [$style._single]: !props.range,
        },
    ]);

    const minValue = computed(() => {
        return Math.min(firstValue.value, secondValue.value);
    });

    const maxValue = computed(() => {
        return Math.max(firstValue.value, secondValue.value);
    });

    const precision = computed(() => {
        const precisions = [props.min, props.max, props.step].map((item) => {
            const decimal = String(item).split('.')[1];
            return decimal ? decimal.length : 0;
        });
        return Math.max.apply(null, precisions);
    });

    const stops = computed(() => {
        if (!props.showStops || props.min > props.max) {
            return [];
        }
        if (props.step === 0) {
            console.warn('[Element Warn][Slider]step should not be 0.');
            return [];
        }

        const stopCount = (props.max - props.min) / props.step;
        const stepWidth = (100 * props.step) / (props.max - props.min);
        const result: number[] = [];

        for (let i = 1; i < stopCount; i++) {
            result.push(i * stepWidth);
        }

        if (props.range) {
            return result.filter(
                (step) =>
                    step < (100 * (minValue.value - props.min)) / (props.max - props.min) ||
                    step > (100 * (maxValue.value - props.min)) / (props.max - props.min)
            );
        } else {
            return result.filter(
                (step) => step > (100 * (firstValue.value - props.min)) / (props.max - props.min)
            );
        }
    });

    const markList = computed(() => {
        if (!props.marks) {
            return [];
        }

        const marksKeys = Object.keys(props.marks);
        return marksKeys
            .map(parseFloat)
            .sort((a, b) => a - b)
            .filter((point) => point <= props.max && point >= props.min)
            .map((point) => ({
                point,
                position: ((point - props.min) * 100) / (props.max - props.min),
                mark: props.marks[point],
            }));
    });

    const progressSize = computed(() => {
        return props.range
            ? `${(100 * (maxValue.value - minValue.value)) / (props.max - props.min)}%`
            : `${(100 * (firstValue.value - props.min)) / (props.max - props.min)}%`;
    });

    const progressStart = computed(() => {
        return props.range
            ? `${(100 * (minValue.value - props.min)) / (props.max - props.min)}%`
            : '0%';
    });

    const progressStyle = computed(() => {
        return {
            width: progressSize.value,
            left:
                (100 * (minValue.value - props.min)) / (props.max - props.min) < 0
                    ? '0%'
                    : progressStart.value,
            transition:
                dragging.value || props.noTransition
                    ? 'left 0s ease, width 0s ease'
                    : 'left .5s ease, width .5s ease',
        };
    });

    const formattedValue = computed(() => {
        if (props.range) {
            return [props.valueFormat(firstValue.value), props.valueFormat(secondValue.value)];
        }
        return props.valueFormat(firstValue.value);
    });
    // #endregion

    // #region Lifecycle
    // Инициализация значений
    onMounted(() => {
        setValues();
        resetSize();

        // Настройка ResizeObserver
        if (window.ResizeObserver) {
            resizeObserver.value = new ResizeObserver(resetSize);
            if (railRef.value) {
                resizeObserver.value.observe(railRef.value);
            }
        }
    });

    onUnmounted(() => {
        if (resizeObserver.value) {
            resizeObserver.value.disconnect();
        }
    });

    // Предоставляем данные для дочерних компонентов
    provide('sliderProps', {
        min: toRef(props, 'min'),
        max: toRef(props, 'max'),
        step: toRef(props, 'step'),
        precision,
        disabled: toRef(props, 'disabled'),
        sliderSize,
    });

    // Expose для родительских компонентов
    defineExpose({
        emitChange,
    });
    // #endregion
</script>

<template>
    <div
        :class="[$style.VRangeSlider, classList]"
        role="slider"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="range ? `${firstValue}-${secondValue}` : firstValue"
        aria-orientation="horizontal"
        :aria-label="`slider between ${min} and ${max}`"
        :aria-disabled="disabled"
    >
        <div
            v-if="showValue"
            :class="$style.values"
        >
            <div :class="[$style.val, $style.subtitle]">
                {{ range ? formattedValue[0] : formattedValue }}
            </div>
            <div
                v-if="range"
                :class="[$style.val, $style.subtitle]"
            >
                {{ formattedValue[1] }}
            </div>
        </div>

        <div
            ref="railRef"
            :class="$style.rail"
            @click="onRailClick"
        >
            <div :class="$style.track">
                <div
                    :class="$style.progress"
                    :style="progressStyle"
                ></div>

                <VRangeSliderDot
                    ref="dot1Ref"
                    v-model="firstValue"
                    :dragging="dragging || noTransition"
                    :focus="focusDotIndex === 0"
                    @dragstart="onDragStart(0)"
                    @dragend="onDragEnd"
                />

                <VRangeSliderDot
                    v-if="range"
                    ref="dot2Ref"
                    v-model="secondValue"
                    :dragging="dragging || noTransition"
                    :focus="focusDotIndex === 1"
                    @dragstart="onDragStart(1)"
                    @dragend="onDragEnd"
                />

                <template v-if="showStops && !markList.length">
                    <div
                        v-for="(stop, index) in stops"
                        :key="index"
                        :class="$style.stop"
                        :style="[{ left: stop + '%' }]"
                    ></div>
                </template>

                <template v-if="markList.length">
                    <div>
                        <div
                            v-for="item in markList"
                            :key="item.point"
                            :class="$style.stop"
                            :style="[{ left: item.position + '%' }]"
                        ></div>
                    </div>

                    <div :class="$style.marks">
                        <div
                            v-for="item in markList"
                            :key="item.point"
                            :class="$style.marksText"
                            :style="[
                                { left: item.position + '%' },
                                item.mark.style ? item.mark.style : '',
                            ]"
                        >
                            {{ item.mark.label ? item.mark.label : item.mark }}
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style lang="scss" module>
    $base-color: $violet;

    .VRangeSlider {
        position: relative;
        width: 100%;
        margin: 1.6rem 0;
        outline: none;
        cursor: pointer;

        /* Модификаторы */
        &._disabled {
            pointer-events: none;
            opacity: 0.4;
            cursor: not-allowed;
        }

        &._single .rail .track .progress {
            left: 0;
        }

        /* Цвета */
        &._base {
            .rail .track .progress {
                background-color: $base-color;
            }

            .stop {
                background-color: $base-color;
            }
        }

        &._dark {
            .rail .track .progress {
                background-color: $base-600;
            }

            .stop {
                background-color: $base-600;
            }
        }
    }

    .values {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .val {
        font-weight: 500;
    }

    .rail {
        position: relative;
        width: 100%;
        height: 0.2rem;
        border-radius: 0.2rem;
        background-color: $grey-light;
        cursor: pointer;
    }

    .track {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .progress {
        position: absolute;
        height: 100%;
        border-radius: 0.2rem;
        transition:
            left 0.5s ease,
            width 0.5s ease;
    }

    .stop {
        position: absolute;
        top: 50%;
        width: 0.4rem;
        height: 0.4rem;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }

    .marks {
        position: relative;
        top: 0.8rem;
    }

    .marksText {
        position: absolute;
        white-space: nowrap;
        font-size: 1.2rem;
        color: $grey;
        transform: translateX(-50%);
    }
</style>

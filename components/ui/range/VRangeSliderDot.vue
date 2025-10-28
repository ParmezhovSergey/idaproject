<script setup lang="ts">
    // #region Imports
    // Types
    import type { IRangeSliderDotProps } from './types';
    // #endregion

    // #region Props
    const $style = useCssModule();

    const props = withDefaults(defineProps<IRangeSliderDotProps>(), {
        modelValue: 0,
        dragging: false,
        focus: false,
    });

    const emit = defineEmits(['update:modelValue', 'dragstart', 'dragend']);

    const hovering = ref(false);
    const isClick = ref(false);
    const startX = ref(0);
    const currentX = ref(0);
    const startPosition = ref(0);

    // Получаем данные от родительского слайдера через provide/inject
    const sliderProps = inject('sliderProps', {
        min: ref(0),
        max: ref(100),
        step: ref(1),
        precision: ref(0),
        disabled: ref(false),
        sliderSize: ref(1),
    });

    const classList = computed(() => [
        {
            [$style._hover]: hovering.value,
            [$style._dragging]: props.dragging,
        },
    ]);

    const currentPosition = computed(() => {
        const range = sliderProps.max.value - sliderProps.min.value;
        const position = ((props.modelValue - sliderProps.min.value) / range) * 100;
        return `${Math.max(0, Math.min(100, position))}%`;
    });

    const styles = computed(() => {
        return {
            left: currentPosition.value,
            transition: props.dragging ? 'left 0s ease' : 'left .5s ease',
        };
    });

    const setPosition = (percent: number) => {
        if (percent === null || isNaN(percent)) {
            return;
        }

        // Ограничиваем процент от 0 до 100
        percent = Math.max(0, Math.min(100, percent));

        // Вычисляем новое значение
        const range = sliderProps.max.value - sliderProps.min.value;
        let newValue = (percent / 100) * range + sliderProps.min.value;

        // Применяем шаг
        const steps = Math.round((newValue - sliderProps.min.value) / sliderProps.step.value);
        newValue = steps * sliderProps.step.value + sliderProps.min.value;

        // Ограничиваем значение диапазоном
        newValue = Math.max(sliderProps.min.value, Math.min(sliderProps.max.value, newValue));

        // Применяем точность
        newValue = parseFloat(newValue.toFixed(sliderProps.precision.value));

        emit('update:modelValue', newValue);
    };

    const onDragging = (event: MouseEvent | TouchEvent) => {
        if (props.dragging) {
            isClick.value = false;

            let clientX: number;
            if (event.type === 'touchmove') {
                const touchEvent = event as TouchEvent;
                clientX = touchEvent.touches[0].clientX;
            } else {
                const mouseEvent = event as MouseEvent;
                clientX = mouseEvent.clientX;
            }

            currentX.value = clientX;
            const diff = ((currentX.value - startX.value) / sliderProps.sliderSize.value) * 100;
            setPosition(startPosition.value + diff);
        }
    };

    const onDragEnd = () => {
        if (props.dragging) {
            setTimeout(() => {
                emit('dragend');
                isClick.value = false;
            }, 0);
            // eslint-disable-next-line no-use-before-define
            unbindEvents();
        }
    };

    const bindEvents = () => {
        window.addEventListener('mousemove', onDragging);
        window.addEventListener('touchmove', onDragging);
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('contextmenu', onDragEnd);
    };

    const unbindEvents = () => {
        window.removeEventListener('mousemove', onDragging);
        window.removeEventListener('touchmove', onDragging);
        window.removeEventListener('mouseup', onDragEnd);
        window.removeEventListener('touchend', onDragEnd);
        window.removeEventListener('contextmenu', onDragEnd);
    };

    const onDragStart = (event: MouseEvent | TouchEvent) => {
        emit('dragstart');

        isClick.value = true;

        if (event.type === 'touchstart') {
            const touchEvent = event as TouchEvent;
            startX.value = touchEvent.touches[0].clientX;
        } else {
            const mouseEvent = event as MouseEvent;
            startX.value = mouseEvent.clientX;
        }

        startPosition.value = parseFloat(currentPosition.value);
    };

    const onMouseEnter = () => {
        hovering.value = true;
    };

    const onMouseLeave = () => {
        hovering.value = false;
    };

    const onLeftKeyDown = () => {
        if (!sliderProps.disabled.value) {
            const newValue = Math.max(
                sliderProps.min.value,
                props.modelValue - sliderProps.step.value
            );
            emit('update:modelValue', newValue);
        }
    };

    const onRightKeyDown = () => {
        if (!sliderProps.disabled.value) {
            const newValue = Math.min(
                sliderProps.max.value,
                props.modelValue + sliderProps.step.value
            );
            emit('update:modelValue', newValue);
        }
    };

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
        if (!sliderProps.disabled.value) {
            onDragStart(e);
            bindEvents();
        }
    };
</script>

<template>
    <div
        :class="[$style.VRangeSliderDot, classList]"
        :style="styles"
        tabindex="0"
        @focus="onMouseEnter"
        @blur="onMouseLeave"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @mousedown.prevent="onMouseDown"
        @touchstart.prevent="onMouseDown"
        @keydown.left="onLeftKeyDown"
        @keydown.right="onRightKeyDown"
        @keydown.down.prevent="onLeftKeyDown"
        @keydown.up.prevent="onRightKeyDown"
    >
        <div :class="['handle', $style.handle]"></div>
    </div>
</template>

<style lang="scss" module>
    $base-color: $violet;

    .VRangeSliderDot {
        position: absolute;
        top: 50%;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.6rem;
        height: 1.6rem;
        text-align: center;
        line-height: normal;
        transform: translate(-50%, -50%);
        user-select: none;
        cursor: pointer;

        .handle {
            width: 1.6rem;
            height: 1.6rem;
            border-radius: 50%;
            border: 0.2rem solid #fff;
            background-color: $base-color;
            transition: all $default-transition;
            box-shadow: 0 0.2rem 0.4rem rgb(0 0 0 / 10%);
        }

        /* Модификаторы */
        &._hover .handle,
        &:hover .handle {
            transform: scale(1.1);
            box-shadow: 0 0.3rem 0.6rem rgb(0 0 0 / 15%);
        }

        &._dragging .handle {
            transform: scale(1.2);
            box-shadow: 0 0.4rem 0.8rem rgb(0 0 0 / 20%);
        }

        &:focus {
            outline: none;

            .handle {
                box-shadow: 0 0 0 0.3rem rgba($base-color, 0.3);
            }
        }
    }
</style>

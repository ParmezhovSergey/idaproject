<script setup lang="ts">
    // #region Imports
    // Utils
    import { getFontSize } from '~/utils/common-utils';

    // Types
    import type { IScrollBoxProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IScrollBoxProps>(), {
        resizable: false,
        skipOffset: false,
        fade: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits<{
        'on-scroll': [];
        'scroll-end': [value: boolean];
    }>();
    // #endregion

    // #region Data
    const $style = useCssModule();

    const contentRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const boxRef = ref<HTMLElement | null>(null);
    const yRailRef = ref<HTMLElement | null>(null);
    const xThumbRef = ref<HTMLElement | null>(null);
    const yThumbRef = ref<HTMLElement | null>(null);
    const xRailRef = ref<HTMLElement | null>(null);
    const placeholderRef = ref<HTMLElement | null>(null);
    const isYOverflowing = ref(false);
    const scrollXTicking = ref(false);
    const scrollYTicking = ref(false);
    const isXOverflowing = ref(false);
    const resizeObserverContent = ref<ResizeObserver | null>(null);
    const draggingAxis = ref<'x' | 'y'>('y');

    const axis = reactive({
        x: {
            clientAttr: 'clientX',
            offsetAttr: 'left',
            offsetSizeAttr: 'offsetWidth',
            scrollSizeAttr: 'scrollWidth',
            scrollOffsetAttr: 'scrollLeft',
            scrollbarSize: 0,
            scrollLeft: 0,
            click: 0,
        },
        y: {
            clientAttr: 'clientY',
            offsetAttr: 'top',
            offsetSizeAttr: 'offsetHeight',
            scrollSizeAttr: 'scrollHeight',
            scrollOffsetAttr: 'scrollTop',
            scrollbarSize: 0,
            scrollTop: 0,
            click: 0,
        },
    });

    const dimensions = reactive({
        boxHeight: 0,
        boxWidth: 0,
        contentHeight: 0,
        contentWidth: 0,
        yRailHeight: 0,
        yThumbHeight: 0,
        xRailWidth: 0,
        xThumbWidth: 0,
    });
    // #endregion

    // #region Methods
    function handleGetScrollbarSize(targetAxis: 'x' | 'y') {
        if (
            contentRef.value &&
            ((targetAxis === 'y' && isYOverflowing) || (targetAxis === 'x' && isXOverflowing))
        ) {
            const contentSize =
                contentRef.value[axis[targetAxis as keyof typeof axis].scrollSizeAttr];
            const trackSize =
                (targetAxis === 'y' ? yRailRef.value?.offsetHeight : xRailRef.value?.offsetWidth) ||
                0;
            const scrollbarRatio = trackSize / contentSize;
            return Math.max(~~(scrollbarRatio * trackSize), 20);
        } else {
            return 0;
        }
    }

    async function onUpdate() {
        const contentHeight = contentRef.value?.scrollHeight || 0;
        const contentWidth = contentRef.value?.scrollWidth || 0;
        const placeholder = placeholderRef.value as HTMLElement;

        // Determine placeholder size
        if (toValue(props.resizable)) {
            const surplus = 5.6 * getFontSize();
            placeholder.style.width = `${Math.round(contentWidth + surplus)}px`;
        }

        placeholder.style.height = `${contentHeight}px`;

        const boxWidth = boxRef.value?.offsetWidth || 0;
        const boxHeight = boxRef.value?.offsetHeight || 0;

        isXOverflowing.value = contentWidth > boxWidth;
        isYOverflowing.value = contentHeight > boxHeight;

        nextTick(() => {
            dimensions.boxHeight = boxHeight;
            dimensions.boxWidth = boxWidth;
            dimensions.contentHeight = contentHeight;
            dimensions.contentWidth = contentWidth;

            if (boxHeight >= contentHeight) {
                emit('scroll-end', true);
            } else {
                emit('scroll-end', false);
            }

            if (isYOverflowing.value && yRailRef.value) {
                dimensions.yRailHeight = yRailRef.value.offsetHeight;
                dimensions.yThumbHeight = handleGetScrollbarSize('y');
            }

            if (isXOverflowing.value && xRailRef.value) {
                dimensions.xRailWidth = xRailRef.value.offsetWidth;
                dimensions.xThumbWidth = handleGetScrollbarSize('x');
            }
        });
    }

    function onScroll() {
        if (!scrollXTicking.value && isXOverflowing.value) {
            requestAnimationFrame(() => {
                axis.x.scrollLeft = wrapperRef?.value?.scrollLeft || 0;
                scrollXTicking.value = false;
            });
            scrollXTicking.value = true;
        }

        if (!scrollYTicking.value && isYOverflowing.value) {
            requestAnimationFrame(() => {
                axis.y.scrollTop = wrapperRef?.value?.scrollTop || 0;
                scrollYTicking.value = false;
            });
            scrollYTicking.value = true;
        }
        emit('on-scroll');
    }

    function onRailClick(e: MouseEvent, targetAxis: 'x' | 'y') {
        if (!wrapperRef.value) {
            return;
        }

        const offset = Math.abs(
            (e.target as HTMLInputElement).getBoundingClientRect()[
                axis[targetAxis as keyof typeof axis].offsetAttr
            ] - e[axis[targetAxis as keyof typeof axis].clientAttr]
        );
        const rail =
            targetAxis === 'y' ? (yRailRef.value as HTMLElement) : (xRailRef.value as HTMLElement);
        const thumb =
            targetAxis === 'y'
                ? (yThumbRef.value as HTMLElement)
                : (xThumbRef.value as HTMLElement);
        const thumbHalf = thumb[axis[targetAxis as keyof typeof axis].offsetSizeAttr] / 2;
        const thumbPositionPercentage =
            ((offset - thumbHalf) * 100) /
            rail[axis[targetAxis as keyof typeof axis].offsetSizeAttr];

        wrapperRef.value[axis[targetAxis as keyof typeof axis].scrollOffsetAttr] =
            (thumbPositionPercentage *
                wrapperRef.value[axis[targetAxis as keyof typeof axis].scrollSizeAttr]) /
            100;
    }

    function onMouseMove(e: MouseEvent) {
        const prevPage = axis[draggingAxis.value].click;
        if (!prevPage || !wrapperRef.value) {
            return;
        }

        const rail =
            draggingAxis.value === 'y'
                ? (yRailRef.value as HTMLElement)
                : (xRailRef.value as HTMLElement);
        const thumb =
            draggingAxis.value === 'y'
                ? (yThumbRef.value as HTMLElement)
                : (xThumbRef.value as HTMLElement);

        const offset =
            (rail.getBoundingClientRect()[axis[draggingAxis.value].offsetAttr] -
                e[axis[draggingAxis.value].clientAttr]) *
            -1;
        const thumbClickPosition = thumb[axis[draggingAxis.value].offsetSizeAttr] - prevPage;
        const thumbPositionPercentage =
            ((offset - thumbClickPosition) * 100) / rail[axis[draggingAxis.value].offsetSizeAttr];

        wrapperRef.value[axis[draggingAxis.value].scrollOffsetAttr] =
            (thumbPositionPercentage * wrapperRef.value[axis[draggingAxis.value].scrollSizeAttr]) /
            100;
    }

    function onMouseUp(e: MouseEvent) {
        e.preventDefault();
        axis[draggingAxis.value].click = 0;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.onselectstart = null;
    }

    function onThumbClick(e: MouseEvent, targetAxis: 'x' | 'y') {
        if (e.ctrlKey || e.button === 2) {
            return;
        }
        e.stopImmediatePropagation();

        axis[targetAxis as keyof typeof axis].click =
            (e.currentTarget as HTMLElement)[axis[targetAxis as keyof typeof axis].offsetSizeAttr] -
            (e[axis[targetAxis as keyof typeof axis].clientAttr] -
                (e.currentTarget as HTMLElement).getBoundingClientRect()[
                    axis[targetAxis as keyof typeof axis].offsetAttr
                ]);

        draggingAxis.value = targetAxis;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.onselectstart = () => false;
    }

    // Lifecycle
    onMounted(() => {
        if (toValue(props.resizable) && contentRef.value) {
            resizeObserverContent.value = new ResizeObserver(() => {
                requestAnimationFrame(() => onUpdate());
            });
            resizeObserverContent.value.observe(contentRef.value);
        } else {
            requestAnimationFrame(() => {
                onUpdate();
            });
        }
    });

    onBeforeUnmount(() => {
        if (toValue(props.resizable) && resizeObserverContent.value && contentRef.value) {
            resizeObserverContent.value.disconnect();
            resizeObserverContent.value.unobserve(contentRef.value);
            resizeObserverContent.value = null;
        }
    });
    // #endregion

    // #region Computed
    const isFadeMaskTop = computed(
        () => axis.y.scrollTop / (dimensions.contentHeight - dimensions.boxHeight) <= 0.02
    );

    const isFadeMaskBottom = computed(
        () => axis.y.scrollTop / (dimensions.contentHeight - dimensions.boxHeight) >= 0.98
    );

    const yScrollPosition = computed(() => {
        if (!isYOverflowing.value) {
            return 'translate3d(0, 0, 0)';
        }

        const scrollPercentage =
            axis.y.scrollTop / (dimensions.contentHeight - dimensions.boxHeight);

        const handleOffset = ~~(
            (dimensions.yRailHeight - dimensions.yThumbHeight) *
            scrollPercentage
        );

        return `translate3d(0, ${handleOffset}px, 0)`;
    });

    const xScrollPosition = computed(() => {
        if (!isXOverflowing.value) {
            return 'translate3d(0, 0, 0)';
        }

        const scrollPercentage =
            axis.x.scrollLeft / (dimensions.contentWidth - dimensions.boxWidth);

        const handleOffset = ~~(
            (dimensions.xRailWidth - dimensions.xThumbWidth) *
            scrollPercentage
        );

        return `translate3d(${handleOffset}px, 0, 0)`;
    });

    const classListMask = computed(() => [
        {
            _top: isFadeMaskTop.value,
            _bottom: isFadeMaskBottom.value,
            _show: props.fade && isYOverflowing.value,
        },
    ]);
    // #endregion
</script>

<template>
    <div
        ref="boxRef"
        :class="['c-scrollbox', $style.VScrollBox, { [$style._margin]: props.hasMargin }]"
        :style="{
            width: props.width ? width : undefined,
            height: props.height ? height : undefined,
        }"
    >
        <div
            ref="placeholderRef"
            :class="['c-scrollbox-placeholder', $style.placeholder]"
        ></div>

        <div :class="[$style.fadeMask, classListMask]">
            <div
                ref="wrapperRef"
                :class="[
                    'scrollbox-wrapper',
                    $style.wrapper,
                    { [$style._offset]: isYOverflowing && !props.skipOffset },
                ]"
                @scroll="onScroll"
            >
                <div
                    ref="contentRef"
                    :class="$style.content"
                >
                    <slot></slot>
                </div>
            </div>
        </div>

        <div
            v-if="isYOverflowing"
            ref="yRailRef"
            :class="[$style.scrollbar, $style._vertical]"
            @mousedown="onRailClick($event, 'y')"
        >
            <div
                ref="yThumbRef"
                :class="$style.thumb"
                :style="{ height: `${dimensions.yThumbHeight}px`, transform: yScrollPosition }"
                @mousedown="onThumbClick($event, 'y')"
            ></div>
        </div>

        <div
            v-if="isXOverflowing"
            ref="xRailRef"
            :class="[$style.scrollbar, $style.horizontal]"
            @mousedown="onRailClick($event, 'x')"
        >
            <div
                ref="xThumbRef"
                :class="$style.thumb"
                :style="{ width: `${dimensions.xThumbWidth}px`, transform: xScrollPosition }"
                @mousedown="onThumbClick($event, 'x')"
            ></div>
        </div>
    </div>
</template>

<style lang="scss" module>
    $scrollbar-color: $violet;

    .VScrollBox {
        position: relative;
        overflow: hidden;

        .thumb {
            background-color: $scrollbar-color;
        }

        .wrapper {
            position: absolute;
            inset: 0 0 0 0;
            z-index: 0;
            box-sizing: border-box;
            overflow: auto;
            width: auto;
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            scrollbar-width: none;
            -ms-overflow-style: none;

            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            &._offset {
                padding-right: 0.4rem;
            }
        }

        .placeholder {
            width: 100%;
            max-width: 100%;
            max-height: 100%;
            pointer-events: none;
        }

        .fadeMask {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;

            &:global {
                &._top {
                    &:before {
                        min-height: 0;
                    }
                }

                &._bottom {
                    &:after {
                        min-height: 0;
                    }
                }

                &._show {
                    &:before,
                    &:after {
                        display: block;
                    }
                }
            }

            &:before,
            &:after {
                content: '';
                position: absolute;
                left: 2px;
                z-index: 2;
                display: none;
                width: calc(100% - 1.2rem - 1px);
                min-height: 4rem;
                transition: min-height 0.2s linear;
                pointer-events: none;
            }

            &:before {
                top: 0;
                background: linear-gradient(
                    to bottom,
                    rgba(255 255 255) 12%,
                    rgba(255 255 255 / 80%) 50%,
                    rgba(255 255 255 / 0%)
                );
            }

            &:after {
                bottom: 0;
                background: linear-gradient(
                    to top,
                    rgba(255 255 255) 12%,
                    rgba(255 255 255 / 80%) 50%,
                    rgba(255 255 255 / 0%)
                );
            }
        }
    }

    .scrollbar {
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 3;
        overflow: hidden;
        width: 0.4rem;
        border-radius: 6rem;
        background-color: transporent;

        &._horizontal {
            left: 0;

            .thumb {
                bottom: 0.1rem;
                left: 0;
                height: 0.4rem;
            }
        }

        &._vertical {
            top: 0;

            .thumb {
                top: 0;
                right: 0;
                width: 0.4rem;
                background-color: $scrollbar-color;
                transition: opacity $default-transition;
                cursor: pointer;

                @media (hover), (-ms-high-contrast: none), (-ms-high-contrast: active) {
                    &:hover {
                        opacity: 0.7;
                    }
                }
            }
        }

        .thumb {
            position: absolute;
            border-radius: 6rem;
        }
    }
</style>

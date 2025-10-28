<script setup lang="ts">
    /* eslint max-lines: off */
    // #region Imports
    // Utils
    import { onClickOutside } from '@vueuse/core';

    // Types
    import type { ISelectProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<ISelectProps>(), {
        name: '',
        size: 'medium',
        color: 'base',
        valueName: 'value',
        labelName: 'label',
        placeholder: 'Все',
        resetLabel: 'Все',
        multiple: false,
        hideSelected: false,
        border: true,
        disabled: false,
        required: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['change', 'focus', 'blur', 'click-outside']);
    // #endregion

    // #region Data
    const $style = useCssModule();

    const selectRef = ref(null);
    const inputRef = ref<HTMLSelectElement | null>(null);
    const isFocused = ref(false);
    const isOpened = ref(false);
    const highlightIndex = ref(-1);
    const inputHovering = ref(false);
    // #endregion

    // #region Methods

    /**
     * Вспомогательный метод для работы с мобильным устройствами.
     * В computed optionList возвращает индекс элемента для аттрибута selected
     * @param {String} value Option value
     * @returns {Boolean} selected Is value selected
     */
    const handleActiveNative = (value: any) => {
        if (props.multiple) {
            return Array.isArray(props.value) ? (props.value as any[]).includes(value) : false;
        } else {
            return value === props.value;
        }
    };

    /**
     * Вспомогательный метод для работы с мобильным устройствами.
     * Возвращает нужные аттрибуты в нативные option
     * @param {Object} opt Option
     * @returns {Object} v-bind Attrs
     */
    const handleOptionAttrs = (opt: any) => {
        const attrs: Record<string, any> = {};

        if (opt.selected) {
            attrs.selected = opt.selected;
        }

        if (opt.disabled) {
            attrs.disabled = 'disabled';
        }

        return attrs;
    };

    /**
     * Вспомогательный метод для выбора значения в multiple режиме
     */
    function getNewValueForMultiple(option) {
        let newValue;
        if (!option[props.valueName]) {
            newValue = '';
        } else if (Array.isArray(props.value)) {
            newValue = props.value.slice();
            if (newValue.includes(option[props.valueName])) {
                newValue.splice(newValue.indexOf(option[props.valueName]), 1);
                if (newValue.length === 1) {
                    newValue = newValue[0];
                }
            } else {
                newValue.push(option[props.valueName]);
            }
        } else {
            newValue = props.value;
            if (newValue === option[props.valueName]) {
                newValue = '';
            } else {
                newValue = newValue.length
                    ? [newValue, option[props.valueName]]
                    : option[props.valueName]
                      ? [option[props.valueName]]
                      : '';
            }
        }
        return newValue;
    }

    /**
     * Вспомогательный метод для выбора значений из нативного селектора (multiple)
     */
    function getSelectedValuesFromNative(nativeEvent) {
        let value: any[] = [];
        for (let i = 0; i < nativeEvent.target.options.length; i++) {
            const opt = nativeEvent.target.options[i];
            if (opt.selected && !opt.disabled) {
                value.push(opt.value);
            }
            if (opt.disabled) {
                opt.selected = false;
            }
        }
        if (value.length && value.includes('')) {
            value = [] as any[];
            for (let i = 0; i < nativeEvent.target.options.length; i++) {
                const opt = nativeEvent.target.options[i];
                opt.selected = false;
            }
        }
        return value;
    }

    /**
     * Метод, который обрабатывает событие blur на инпуте
     */
    const onBlur = () => {
        if (isOpened.value) {
            isOpened.value = false;
        }
        isFocused.value = false;
        inputRef.value?.blur();

        /**
         * Передаёт родителю, что компонент больше не находится в focus.
         * В большинстве реализаций - может и не пригодится
         * @event blur
         */
        emit('blur');
    };

    /**
     * Метод, который обрабатывает событие focus на инпуте
     */
    const onFocus = () => {
        isFocused.value = true;
        inputRef.value?.focus();
        emit('focus');
    };

    /**
     * Вызывается в тот момент, когда пользовать
     * сделал клик за пределы вызываемого селектором окна
     */
    const onClickOutsideHandler = () => {
        onBlur();
        emit('click-outside');
    };

    /**
     * Открывает или закрывает попап меню выбора
     */
    onClickOutside(selectRef, () => {
        if (isOpened.value) {
            onClickOutsideHandler();
        }
    });
    // #endregion

    const isDisabled = computed(() => {
        return props.disabled || props.specs.length === 0;
    });

    const handleToggleMenu = () => {
        if (isDisabled.value) {
            return;
        }

        isOpened.value = !isOpened.value;

        if (isOpened.value) {
            inputRef.value?.focus();
        }
    };

    // #region Computed
    const nativeSelectorAttrs = computed(() => {
        const options: Record<string, any> = {};
        if (props.required) {
            options.required = true;
        }

        if (props.multiple) {
            options.multiple = 'multiple';
        }

        return options;
    });

    const selectedOption = computed(() => {
        if (props.multiple) {
            if (props.value) {
                if (Array.isArray(props.value)) {
                    return props.specs.filter((a) =>
                        (props.value as any[]).includes(a[props.valueName])
                    );
                } else {
                    const selected = props.specs.filter(
                        (a) => a[props.valueName] === props.value
                    )[0];
                    if (!selected) {
                        console.warn('Error occured while selected computed');
                    }
                    return selected;
                }
            } else {
                return null;
            }
        } else {
            return props.specs.filter((a) => a[props.valueName] === props.value)[0] || null;
        }
    });

    const classList = computed(() => [
        {
            [$style[`_${props.color}`]]: props.color,
            [$style[`_${props.size}`]]: props.size,
            [$style._border]: props.border,
            [$style._selected]: selectedOption.value,
            [$style._focused]: isFocused.value,
            [$style._opened]: isOpened.value,
            [$style._disabled]: isDisabled.value,
        },
    ]);

    const optionList = computed(() => {
        const specs: any[] = [];

        props.specs.forEach((opt, index) => {
            if (opt[props.valueName] === props.value && props.hideSelected) {
                return;
            }

            specs.push({
                ...opt,
                disabled:
                    props.facets &&
                    !props.facets.includes(opt[props.valueName]) &&
                    opt[props.valueName] !== '',
                selected: handleActiveNative(opt[props.valueName]) ? index + 1 : false,
            });
        });

        if (!props.required && props.resetLabel) {
            specs.unshift({
                [props.labelName]: props.resetLabel,
                [props.valueName]: '',
                disabled: !(
                    !props.multiple ||
                    (props.multiple && Array.isArray(props.value) && props.value.length)
                ),
            });
        }

        return specs;
    });

    // eslint-disable-next-line complexity
    const selectedLabel = computed(() => {
        if (props.multiple) {
            if (props.value !== '') {
                if (Array.isArray(props.value)) {
                    return selectedOption.value && Array.isArray(selectedOption.value)
                        ? selectedOption.value
                              .reduce((acc, cur) => `${acc + cur?.[props.labelName]}, `, '')
                              .toString()
                              .slice(0, -2)
                        : '';
                } else {
                    return selectedOption.value?.[props.labelName];
                }
            }
            if (!props.required && props.resetLabel && props.value) {
                return props.resetLabel;
            } else {
                return props.placeholder;
            }
        } else {
            return selectedOption.value
                ? selectedOption.value?.[props.labelName]
                : props.placeholder;
        }
    });
    // #endregion

    // #region Methods
    const onOptionSelect = (option) => {
        let newValue;
        if (props.multiple) {
            newValue = getNewValueForMultiple(option);
        } else {
            newValue =
                props.value !== option[props.valueName] || props.required
                    ? option[props.valueName]
                    : '';
        }

        if (!props.multiple || newValue === '') {
            onBlur();
        }

        if (props.name) {
            newValue = { [props.name]: newValue };
        }

        /**
         * Отдаёт выбранный вариант родителю
         * @event change
         * @param {Object|Array} option Объект или массив селектора
         */
        emit('change', newValue);
        onFocus();
    };

    /**
     * Метод, аналогичный onOptionSelect методу, но для работы
     * нативного селектора, который отображается на мобильных устройствах
     */
    const onNativeChange = (option: any) => {
        let newValue: any = '';
        if (props.multiple) {
            const value = getSelectedValuesFromNative(option);
            newValue = props.name
                ? { [props.name]: value.length ? value : '' }
                : value.length
                  ? value
                  : '';
        } else {
            newValue = props.name ? { [props.name]: option.target.value } : option.target.value;
        }
        /**
         * Отдаёт выбранный вариант родителю
         * @event change
         * @param {Object|Array} option Объект или массив селектора
         */
        emit('change', newValue);
    };

    /**
     * Перехватывает событие, при нажатии клавиши enter,
     * Открывает закрытый селектор или выбирает текущий item
     */
    const onEnterPress = () => {
        if (!isOpened.value) {
            handleToggleMenu();
        } else if (optionList.value[highlightIndex.value]) {
            onOptionSelect(optionList.value[highlightIndex.value]);
        }
    };

    /**
     * Для навигации с помощью клавиш up/down,
     * перехватывая нажатия этих клавиш
     * @param {String} direction Направление
     */
    const handleNavigateOptions = (direction) => {
        // eslint-disable-next-line complexity
        if (!isOpened.value) {
            isOpened.value = true;
            return;
        }

        if (direction === 'down') {
            highlightIndex.value++;
            if (highlightIndex.value === optionList.value.length) {
                highlightIndex.value = 0;
            }
        } else if (direction === 'up') {
            highlightIndex.value--;
            if (highlightIndex.value < 0) {
                highlightIndex.value = optionList.value.length - 1;
            }
        }

        const option = optionList.value[highlightIndex.value];

        if (option.disabled) {
            handleNavigateOptions(direction);
        }
    };
    // #endregion
</script>

<template>
    <div
        ref="selectRef"
        :class="[$style.VSelect, classList]"
    >
        <div
            :class="$style.field"
            @click.stop="handleToggleMenu"
        >
            <input
                ref="inputRef"
                :class="$style.nativeInput"
                type="text"
                :value="selectedLabel"
                :disabled="isDisabled"
                :readonly="true"
                :name="name"
                :data-test-id="name"
                @focus="onFocus"
                @keydown.down.stop.prevent="handleNavigateOptions('down')"
                @keydown.up.stop.prevent="handleNavigateOptions('up')"
                @keydown.enter.prevent="onEnterPress"
                @keydown.esc="isOpened = false"
                @keydown.tab="onBlur"
                @mouseenter="inputHovering = true"
                @mouseleave="inputHovering = false"
            />

            <Icon
                :class="$style.arrow"
                name="icons:drop"
            />
        </div>

        <transition name="dropdown">
            <div
                v-if="isOpened"
                :class="$style.dropdown"
            >
                <VScrollBox
                    :class="$style.scrollbox"
                    resizable
                    @close="onClickOutsideHandler"
                >
                    <DropdownOption
                        v-for="(option, index) in optionList"
                        :key="`${index}_${option[valueName]}`"
                        :option="option"
                        :value="value"
                        :value-name="valueName"
                        :label-name="labelName"
                        :size="size"
                        :color="color"
                        :is-highlighted="highlightIndex === index"
                        @mouseenter="highlightIndex = index"
                        @mouseleave="highlightIndex = -1"
                        @click="onOptionSelect"
                    />
                </VScrollBox>
            </div>
        </transition>

        <select
            v-show="!isDisabled"
            :name="name"
            v-bind="nativeSelectorAttrs"
            :class="$style.nativeSelect"
            @change="onNativeChange"
        >
            <option
                v-for="(option, index) in optionList"
                :key="`${index}_mobile_${option[valueName]}`"
                :value="option[valueName]"
                v-bind="handleOptionAttrs(option)"
            >
                {{ option[labelName] }}
            </option>
        </select>
    </div>
</template>

<style lang="scss" module>
    $white-color: $white;
    $grey-color: $grey-light;
    $black-color: $base-600;
    $active-color: $violet;

    .VSelect {
        position: relative;
        user-select: none;

        /* Sizes */
        &._small {
            select.nativeSelect,
            input.nativeInput {
                font-size: 1.4rem;
                line-height: 1.4rem;
            }

            input.nativeInput {
                padding-right: 2.4rem;
            }

            &._border {
                input.nativeInput {
                    padding-bottom: 1rem;
                }
            }

            .arrow {
                top: 0.4rem;
                width: 1rem;
                height: 1rem;
            }
        }

        &._medium {
            select.nativeSelect,
            input.nativeInput {
                font-size: 1.6rem;
                line-height: 1.6rem;
            }

            input.nativeInput {
                padding-right: 2.4rem;
            }

            &._border {
                input.nativeInput {
                    padding-bottom: 1.8rem;
                }
            }

            .arrow {
                top: 0.4rem;
                width: 1.2rem;
                height: 1.2rem;
            }
        }

        /* Colors */
        &._base {
            input.nativeInput,
            .arrow {
                &:hover {
                    opacity: 0.7;
                }
            }

            .dropdown {
                background: $white-color;
                color: $black-color;
            }

            &:after {
                background-color: $grey-color;
            }
        }

        &._dark {
            input.nativeInput,
            .arrow {
                color: $white-color;

                &:hover {
                    opacity: 0.7;
                }
            }

            .dropdown {
                background: $black-color;
                color: $white-color;
            }

            &:after {
                background-color: $grey-color;
            }
        }

        /* Modificators */
        &._border {
            &:after {
                content: '';
                position: absolute;
                bottom: -0.2rem;
                left: 0;
                width: 100%;
                height: 0.2rem;
                border-radius: 0.6rem;
                background-color: $grey-color;
            }
        }

        &._selected {
            &:after {
                background-color: $active-color;
            }
        }

        &._focused {
            input.nativeInput {
                border-color: $active-color;
            }
        }

        &._opened {
            .arrow {
                transform: rotate(180deg);
            }
        }

        &._disabled {
            opacity: 0.5;
            pointer-events: none;

            select.nativeSelect {
                pointer-events: none;
            }
        }
    }

    .field {
        position: relative;
        width: 100%;
    }

    .arrow {
        position: absolute;
        right: 0;
        height: 100%;
        transition: all 0.3s;
        cursor: pointer;

        svg {
            width: 100%;
            height: 100%;
        }

        &:hover {
            opacity: 0.7;
        }
    }

    .dropdown {
        position: absolute;
        top: calc(100% - 0.4rem);
        left: 0;
        z-index: 10;
        display: block;
        width: 100%;
        padding: 1.2rem 0;
        border-radius: 0.4rem;
        transform: translate3d(0, 0, 0);
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        box-shadow: 8px 8px 30px rgb(0 0 0 / 12%);

        .scrollbox {
            max-height: 18rem;
        }

        @include respond-to(tablet) {
            z-index: -1;
            display: none;
            pointer-events: auto;
        }
    }

    input.nativeInput {
        overflow: hidden;
        display: inline-block;
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        transition:
            color $default-transition,
            opacity $default-transition,
            background $default-transition;
        cursor: pointer;

        &::selection {
            background: transparent;
        }

        &:hover {
            opacity: 0.7;
        }
    }

    select.nativeSelect {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        opacity: 0;
        pointer-events: none;

        @include respond-to(tablet-sm) {
            z-index: 2;
            display: block;
            pointer-events: auto;
        }
    }
</style>

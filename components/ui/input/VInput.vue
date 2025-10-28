<script setup lang="ts">
    // #region Imports
    // Utils
    import { masks, numberInputs, addMask, setCursor } from '~/utils/mask-utils';

    // Types
    import type { IInputProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IInputProps>(), {
        size: 'medium',
        color: 'base',
        type: 'text',
        value: '',
        autocomplete: true,
        label: '',
        keepLabel: true,
        msg: '',
        suffixIcon: '',
        mask: '',
        premask: true,
        keepMasked: true,
        border: true,
        error: false,
        disabled: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['input', 'focus', 'blur']);
    // #endregion

    // #region Data
    const $style = useCssModule();
    const attrs = useAttrs();

    const isFocused = ref(false);
    const currentMask = ref('');
    // #endregion

    // #region Computed
    const inputValue = computed(() => {
        if (props.mask) {
            return addMask(props.value, currentMask.value);
        }
        return props.value;
    });

    const classList = computed(() => ({
        [$style[`_${props.color}`]]: props.size,
        [$style[`_${props.size}`]]: props.size,
        [$style._active]: props.value || isFocused.value,
        [$style._suffix]: props.suffixIcon,
        [$style._disabled]: props.disabled,
        [$style._error]: props.error,
        [$style._showLabel]: Boolean(props.label),
        [$style._keep]: props.keepLabel,
        [$style._border]: props.border,
        [$style._success]:
            props.mask && !props.error && currentMask.value.length === inputValue.value.length,
    }));

    const currentPremask = computed(() => {
        if (!props.mask) {
            return '';
        }

        if (inputValue.value.length) {
            const regex = new RegExp('^.{0,' + inputValue.value.length + '}', 'g');
            const pre = currentMask.value.replace(regex, `<span>${inputValue.value}</span>`);
            return pre.replace(/#/g, '&ensp;');
        } else {
            return currentMask.value.replace(/#/g, '&ensp;');
        }
    });

    const attributes = computed(() => {
        const computedAttrs: any = {
            ...attrs,
            type: 'text',
            disabled: props.disabled,
        };

        if (props.label) {
            computedAttrs.ariaLabel = props.label;
        }

        if (props.mask) {
            computedAttrs.maxlength = currentMask.value.length;
        }

        if (props.type) {
            if (props.mask) {
                computedAttrs.type = numberInputs.includes(props.mask) ? 'tel' : 'text';
            } else {
                computedAttrs.type = props.type;
            }
        }

        if (!props.autocomplete) {
            computedAttrs.autocomplete = 'off';
        }

        return computedAttrs;
    });
    // #endregion

    // #region Methods
    // eslint-disable-next-line complexity
    const onInput = (e) => {
        if (props.mask) {
            let position = e.target.selectionEnd;
            const digit = e.target.value[position - 1];

            // Заменяет 8 при вводе на +7,
            // если это первый символ
            if (props.mask === 'phone' && e.target.value.charAt(0) == 8) {
                e.target.value = '+7';
            }

            e.target.value = addMask(e.target.value, currentMask.value);

            if (position !== 0) {
                while (
                    position < e.target.value.length &&
                    e.target.value.charAt(position - 1) !== digit
                ) {
                    position++;
                }
            }

            setCursor(e.target, position);

            if (props.mask === 'percent') {
                if (e.target.value === '00') {
                    e.target.value = 1;
                }
                e.target.value = e.target.value > 100 ? '100%' : e.target.value + '%';
            } else if (props.mask === 'months') {
                if (e.target.value > 360) {
                    e.target.value = 360;
                }
            }
            if (e.target.value !== inputValue.value) {
                const emitVal = props.keepMasked
                    ? e.target.value
                    : addMask(e.target.value, currentMask.value, false);
                emit('input', emitVal);
                return;
            }
        }

        emit('input', e.target.value);
    };

    const onFocus = (e) => {
        isFocused.value = true;

        // Automatically add '+7' characters
        if (props.mask && props.mask === 'phone' && !inputValue.value) {
            nextTick(() => {
                setCursor(e.target, inputValue.value.length);
            });
        }

        emit('focus', e);
    };

    const onBlur = (e) => {
        isFocused.value = false;

        emit('blur', e);

        // Automatically remove '+' or '+7' character
        if (
            props.mask &&
            props.mask === 'phone' &&
            (inputValue.value === '+' || inputValue.value === '+7')
        ) {
            emit('input', '');
        }
    };

    const onPaste = (e) => {
        const clipboardValue = e?.clipboardData?.getData('text');

        // заменяет 8 на +7 при вставке из буфера обмена
        // если это первый символ и тип маски "phone"
        if (props.mask === 'phone' && clipboardValue?.[0] === '8') {
            e.target.value = clipboardValue.replace(/8/, '+7');
        }

        e.target.value = addMask(e.target.value, currentMask.value);

        emit('input', e.target.value);
    };
    // #endregion

    // #region Lifecycle
    onMounted(() => {
        if (props.mask) {
            try {
                currentMask.value = masks[props.mask];
                if (!currentMask.value) {
                    throw new Error(`VInput: mask-utils: mask ${props.mask} not found`);
                }
            } catch (e) {
                console.log(e);
            }
        }
    });
    // #endregion
</script>

<template>
    <div :class="[$style.VInput, classList]">
        <div :class="$style.inner">
            <input
                :aria-label="label"
                :class="$style.native"
                :tabindex="0"
                :value="inputValue"
                v-bind="attributes"
                :name="name"
                :data-test-id="name"
                @blur="onBlur"
                @focus="onFocus"
                @input="onInput"
                @paste.stop="onPaste"
            />

            <span
                v-if="suffixIcon"
                :class="$style.suffix"
            >
                <Icon
                    :class="`icon-${suffixIcon}`"
                    :name="`icons:${suffixIcon}`"
                />
            </span>

            <div
                v-if="premask"
                :class="$style.premask"
                v-html="currentPremask"
            ></div>
        </div>

        <span :class="$style.label">
            {{ label }}
        </span>

        <transition name="fade-fast">
            <InputHint
                v-if="msg"
                :color="color"
            >
                {{ msg }}
            </InputHint>
        </transition>
    </div>
</template>

<style lang="scss" module>
    $white-color: $white;
    $grey-light-color: $grey-middle;
    $grey-color: $grey;
    $black-color: $base-600;
    $active-color: $violet;
    $alert-color: $error;
    $success-color: $accept;

    .VInput {
        position: relative;
        width: 100%;

        /* Sizes */
        &._small {
            &._showLabel {
                &._active._keep {
                    .label {
                        font-size: 1rem;
                        transform: translateY(-2rem);

                        @include respond-to(mobile) {
                            font-size: 1rem;
                            transform: translateY(3rem);
                        }
                    }
                }
            }

            .premask,
            .label,
            .native {
                font-size: 1.4rem;
                line-height: 1.4rem;

                @include respond-to(mobile) {
                    // Обязательно в px и не меньше 16px, чтобы не был автозума на айфонах
                    font-size: 16px;
                }
            }

            &._border {
                .premask,
                .label,
                .native {
                    padding-bottom: 1rem;
                }
            }
        }

        &._medium {
            &._showLabel {
                &._active._keep {
                    .label {
                        font-size: 1.2rem;
                        transform: translateY(-2.4rem);

                        @include respond-to(mobile) {
                            font-size: 1.2rem;
                            transform: translateY(3.6rem);
                        }
                    }
                }
            }

            .premask,
            .label,
            .native {
                font-size: 1.6rem;
                line-height: 1.6rem;

                @include respond-to(mobile) {
                    // Обязательно в px и не меньше 16px, чтобы не был автозума на айфонах
                    font-size: 16px;
                }
            }

            &._border {
                .premask,
                .label,
                .native {
                    padding-bottom: 1.2rem;
                }
            }
        }

        /* Colors */
        &._base {
            input.native {
                color: $black-color;
            }

            .premask,
            .label {
                color: $grey-color;
            }
        }

        &._dark {
            input.native {
                color: $white-color;
            }

            .premask,
            .label {
                color: $grey-light-color;
            }
        }

        /* Mods */
        &._border {
            .inner {
                &:before,
                &:after {
                    content: '';
                    position: absolute;
                    bottom: -0.2rem;
                    left: 0;
                    width: 100%;
                    height: 0.2rem;
                    border-radius: 0.6rem;
                }

                &:before {
                    z-index: 1;
                    background-color: $active-color;
                }

                &:after {
                    z-index: 2;
                    background-color: $active-color;
                    transform: scaleX(0);
                    transform-origin: left center;
                    transition: all $default-transition;
                }
            }
        }

        &._showLabel {
            &._active._keep {
                .label {
                    opacity: 1;
                }
            }

            .label {
                opacity: 1;
                transition: 0.3s all ease;
            }
        }

        &._active {
            .inner:after {
                transform: scaleX(1);
            }

            .premask {
                opacity: 0.5;

                span {
                    opacity: 0;
                }
            }

            .label {
                opacity: 0;
            }
        }

        &._success {
            .inner:after {
                background-color: $success-color;
                transform: scaleX(1);
            }
        }

        &._error {
            .inner:after {
                background-color: $alert-color;
                transform: scaleX(1);
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

    .premask,
    .native,
    .label {
        font-weight: 500;
    }

    .premask,
    .native {
        width: 100%;
    }

    .label {
        position: absolute;
        bottom: 0;
        left: 0;
        opacity: 0;
        transition: opacity $default-transition;
        pointer-events: none;
    }

    .inner {
        position: relative;
        z-index: 2;
    }

    .suffix {
        position: absolute;
        top: 0;
        right: 0.6rem;
        height: 100%;
        text-align: center;
        color: $black-color;

        &:after {
            content: '';
            display: inline-block;
            width: 0;
            height: 100%;
            vertical-align: middle;
        }
    }

    .premask {
        position: absolute;
        bottom: -0.1rem;
        left: 0;
        z-index: 1;
        display: inline-flex;
        height: 100%;
        margin: 0;
        opacity: 0;
        transition: opacity $default-transition;
        user-select: none;
        pointer-events: none;

        @include respond-to(mobile) {
            bottom: -0.3rem;
        }
    }

    .icon {
        pointer-events: all;
        transition: color 0.2s;
        cursor: pointer;

        &:hover {
            color: $black-color;
        }
    }
</style>

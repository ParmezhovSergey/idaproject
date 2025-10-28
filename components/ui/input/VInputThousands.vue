<script setup lang="ts">
    // #region Imports
    // Types
    import type { IInputThousandsProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IInputThousandsProps>(), {
        value: '',
        name: '',
        size: 'medium',
        color: 'base',
        disabled: false,
        error: false,
        delimiter: ' ',
        decimalMark: '.',
        decimalCount: 2,
        length: () => ({ maxlength: null, minlength: null }),
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['input', 'change', 'focus', 'blur']);
    // #endregion

    // #region Data
    const $style = useCssModule();
    const attrs = useAttrs();

    const inputRef = ref<HTMLInputElement | null>(null);
    const isFocused = ref(false);
    const splittedValue = ref('');
    // #endregion

    // #region Computed
    const classList = computed(() => ({
        [$style[`_${props.color}`]]: props.color,
        [$style[`_${props.size}`]]: props.size,
        [$style._active]: isFocused.value,
        [$style._disabled]: props.disabled,
    }));

    const inputAttrs = computed(() => {
        let computedAttrs = {
            ...attrs,
        };

        if (props.disabled) {
            computedAttrs.disabled = 'disabled';
        }

        if (Object.values(props.length).length) {
            computedAttrs = {
                ...computedAttrs,
                ...props.length,
            };
        }

        return computedAttrs;
    });

    const cleanValue = computed(() => {
        return Number(splittedValue.value.split(props.delimiter).join(''));
    });
    // #endregion

    // #region Methods
    const splitThousands = (value) => {
        if (typeof value !== 'number' && typeof value !== 'string') {
            console.warn('[VInputThousands] Wrong prop value');
            return '';
        }

        let partDecimal = '';
        let parts;

        value = value.toString();
        value = value
            .replace(/[A-Za-z]/g, '')
            .replace(props.decimalMark, 'M')
            .replace(/[^\dM-]/g, '')
            .replace(/^-/, 'N')
            .replace(/-/g, '')
            .replace('N', props.positiveOnly ? '' : '-')
            .replace('M', props.decimalMark);

        const partSign = value.slice(0, 1) === '-' ? '-' : '';
        const partSignAndPrefix = partSign;
        let partInteger = value;

        if (value.indexOf(props.decimalMark) >= 0) {
            parts = value.split(props.decimalMark);
            partInteger = parts[0];
            partDecimal = `${props.decimalMark}${parts[1].slice(0, props.decimalCount)}`;
        }

        if (partSign === '-') {
            partInteger = partInteger.slice(1);
        }

        partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + props.delimiter);

        return (
            partSignAndPrefix +
            partInteger.toString() +
            (props.decimalCount > 0 ? partDecimal.toString() : '')
        );
    };

    const stripDelimiters = (value, delimiter) => {
        const delimiterRE = delimiter
            ? new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'g')
            : '';
        return value.replace(delimiterRE, '');
    };

    const getPositionOffset = (prevPos, oldValue, newValue, delimiter) => {
        const oldRawValue = stripDelimiters(oldValue.slice(0, prevPos), delimiter);
        const newRawValue = stripDelimiters(newValue.slice(0, prevPos), delimiter);
        const lengthOffset = oldRawValue.length - newRawValue.length;
        return lengthOffset !== 0 ? lengthOffset / Math.abs(lengthOffset) : 0;
    };

    const getNextCursorPosition = (prevPos, oldValue, newValue, delimiter) => {
        return oldValue.length === prevPos
            ? newValue.length
            : prevPos + getPositionOffset(prevPos, oldValue, newValue, delimiter);
    };

    const setCursor = (el, position) => {
        const setSelectionRange = () => {
            el.setSelectionRange(position, position);
        };

        if (el === document.activeElement) {
            setSelectionRange();
            // Android Fix
            setTimeout(setSelectionRange, 1);
        }
    };

    const onChange = () => {
        // strip any leading zeros
        if (splittedValue.value.length > 1 && splittedValue.value[0] === '0') {
            splittedValue.value = splitThousands(
                cleanValue.value.toString().replace(/^(-)?0+(?=\d)/, '$1')
            );
        }

        if (!splittedValue.value || splittedValue.value === '0') {
            splittedValue.value = splitThousands(props.defaultValue);
        }

        nextTick(() => {
            emit('change', cleanValue.value);
        });
    };

    const onFocus = (e) => {
        isFocused.value = true;
        emit('focus', e);
    };

    const onBlur = (e) => {
        isFocused.value = false;
        onChange();
        emit('blur', e);
    };

    const onInput = (e) => {
        let endPos = e.target.selectionEnd;
        const oldValue = e.target.value;
        const newValue = splitThousands(e.target.value);
        e.target.value = newValue;
        splittedValue.value = newValue;

        nextTick(() => {
            endPos = getNextCursorPosition(endPos, oldValue, newValue, props.delimiter);
            setCursor(e.target, endPos);
            emit('input', cleanValue.value);
        });
    };
    // #endregion

    // #region Watchers
    watch(
        () => props.value,
        (newValue) => {
            if (newValue !== cleanValue.value) {
                splittedValue.value = splitThousands(newValue);
            }
        }
    );
    // #endregion

    // Region Lifecycle
    onMounted(() => {
        splittedValue.value = splitThousands(props.value);
    });
    // #endregion
</script>

<template>
    <div :class="['v-input', $style.VInputThousands, classList]">
        <div :class="['v-input__inner', $style.inner]">
            <input
                ref="inputRef"
                :class="['v-input__native', $style.native]"
                v-bind="inputAttrs"
                :value="splittedValue"
                :name="name"
                :data-test-id="name"
                type="text"
                @keydown.enter="inputRef?.blur()"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
            />
        </div>
    </div>
</template>

<style lang="scss" module>
    $white-color: $white;
    $grey-color: $grey-light;
    $black-color: $base-600;
    $active-color: $violet;

    .VInputThousands {
        position: relative;
        width: 100%;
        padding-top: 1.6rem;

        /* Sizes */
        &._small {
            input.native {
                font-size: 1.4rem;
                line-height: 1.4rem;
            }
        }

        &._medium {
            input.native {
                font-size: 1.6rem;
                line-height: 1.6rem;
            }
        }

        /* Colors */
        &._base {
            input.native {
                color: $black-color;
            }
        }

        &._dark {
            input.native {
                color: $white-color;
            }
        }

        /* Modificators */
        &._active {
            input.native {
                color: $active-color;
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

    input.native {
        transition: color $default-transition;
    }

    .inner {
        position: relative;
        z-index: 2;
    }
</style>

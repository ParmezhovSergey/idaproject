<script setup lang="ts">
    // #region Imports
    // Types
    import type { IDropdownOptionProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IDropdownOptionProps>(), {
        option: () => ({}),
        valueName: 'value',
        labelName: 'label',
        size: 'medium',
        isHighlighted: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['click', 'mouseenter', 'mouseleave']);
    // #endregion

    // #region Data
    const $style = useCssModule();
    // #endregion

    // #region Methods
    const onClick = () => {
        if (props.option.disabled) {
            return;
        }

        emit('click', props.option);
    };

    const onMouseEnter = () => {
        if (props.option.disabled) {
            return;
        }

        emit('mouseenter');
    };

    const onMouseLeave = () => {
        if (props.option.disabled) {
            return;
        }

        emit('mouseleave');
    };
    // #endregion

    // #region Computed
    const isSelected = computed(() => {
        if (Array.isArray(props.value)) {
            return props.value.includes(props.option[props.valueName]);
        } else {
            return props.value === props.option[props.valueName];
        }
    });

    const classList = computed(() => [
        {
            [$style[`_${props.size}`]]: props.size,
            [$style._highlighted]: props.isHighlighted,
            [$style._selected]: isSelected.value,
            [$style._disabled]: props.option.disabled,
        },
    ]);
    // #endregion
</script>

<template>
    <div
        :class="[$style.DropdownOption, classList]"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click="onClick"
    >
        {{ option[labelName] }}
    </div>
</template>

<style lang="scss" module>
    $active-color: $violet;

    .DropdownOption {
        font-weight: 500;
        cursor: pointer;

        /* Sizes */
        &._small {
            padding: 1rem 2.4rem;
            font-size: 1.2rem;
            line-height: 1.2rem;
        }

        &._medium {
            padding: 1.2rem 3.2rem;
            font-size: 1.6rem;
            line-height: 1.2;
        }

        /* Modificators */
        &._highlighted {
            background-color: rgba($active-color, 0.3);
        }

        &._selected {
            color: $active-color;
        }

        &._disabled {
            opacity: 0.4;
            transition: $default-transition;
            cursor: not-allowed;
        }

        &._hidden {
            display: none;
        }
    }
</style>

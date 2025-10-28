<script setup lang="ts">
    // #region Imports
    // Types
    import type { IInputHintProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IInputHintProps>(), {
        color: 'base',
    });
    // #endregion

    // #region Data
    const $style = useCssModule();
    // #endregion

    // #region Computed
    const classList = computed(() => ({
        [$style[`_${props.color}`]]: props.color,
    }));
    // #endregion
</script>

<template>
    <div :class="[$style.InputHint, classList]">
        <slot></slot>
    </div>
</template>

<style module lang="scss">
    $grey-color: $grey;
    $alert-color: $error;
    $grey-light-color: $grey-middle;

    .InputHint {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        font-size: 1.2rem;

        /* Colors */
        &._base {
            color: $grey-color;
        }

        &._dark {
            color: $grey-light-color;
        }

        @include respond-to(mobile) {
            font-size: 1.2rem;
        }
    }
</style>

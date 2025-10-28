<template>
    <div :class="$style.default">
        <TheHeader />
        <main :class="$style.main">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
    // #region Imports
    // Components
    import TheHeader from '~/components/layout/TheHeader.vue';
    // #endregion
</script>

<style module lang="scss">
    .default {
        //
    }

    .main {
        padding-top: 8rem; /* Account for fixed header */
    }
</style>

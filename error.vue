<script setup lang="ts">
    import type { NuxtError } from '#app';

    const props = defineProps<{
        error: NuxtError;
    }>();

    const $style = useCssModule();

    const errorData = reactive({
        statusCode: props.error.statusCode || 500,
        statusMessage: props.error.statusMessage || 'Internal Server Error',
    });
</script>

<template>
    <div :class="$style.Error">
        <h1 :class="$style.title">
            <template v-if="errorData.statusCode === 404">Error 404</template>
            <template v-else>
                Что-то пошло
                <br />
                не так…
            </template>
        </h1>

        <h2 :class="$style.code">
            {{ errorData.statusCode }}
        </h2>
    </div>
</template>

<style lang="scss" module>
    .Error {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        height: 100%;
        min-height: 72rem;
        padding-top: 6.4rem;
        padding-right: $aside-padding;
        padding-left: $aside-padding;
        text-align: center;
        flex-direction: column;
    }

    .title {
        margin-bottom: 2rem;
        font-size: 3.2rem;
        font-weight: 600;
    }

    .code {
        font-size: 5rem;
        font-weight: bold;
        color: $violet;
    }
</style>

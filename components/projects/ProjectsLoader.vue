<script setup lang="ts">
    // #region Data
    const $style = useCssModule();
    // #endregion
</script>

<template>
    <div :class="$style.ProjectsLoader">
        <div
            v-for="i in 6"
            :key="i"
            :class="$style.loaderCard"
        >
            <div :class="$style.loaderImage"></div>
            <div :class="$style.loaderContent">
                <div :class="$style.loaderLine"></div>
                <div :class="$style.loaderLine"></div>
                <div :class="$style.loaderLine"></div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" module>
    .ProjectsLoader {
        display: flex;
        flex-wrap: wrap;
        margin: -0.8rem;
        padding-top: 1.6rem;

        @include respond-to(tablet) {
            margin: 0 0 2.4rem;
            padding: 0;
        }
    }

    .loaderCard {
        position: relative;
        overflow: hidden;
        width: 33.3%;
        height: 50rem;
        padding: 0.8rem;

        @include respond-to(tablet) {
            width: 50%;
            height: 42rem;
            padding: 0.6rem;
        }

        @include respond-to(mobile) {
            width: 100%;
            height: 19.8rem;
            margin-bottom: 1.2rem;
            padding: 0;

            &:last-child {
                margin-bottom: 0;
            }
        }

        &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgb(255 255 255 / 40%), transparent);
            transform: translateX(-100%);
            animation: shimmer 2s infinite;
        }
    }

    .loaderImage {
        width: 100%;
        height: 60%;
        border-radius: 0.5rem 0.5rem 0 0;
        background: #e9ecef;
    }

    .loaderContent {
        display: flex;
        height: 40%;
        padding: 2rem;
        border-radius: 0 0 0.5rem 0.5rem;
        background: #f8f9fa;
        flex-direction: column;
        gap: 1rem;
    }

    .loaderLine {
        height: 1.5rem;
        border-radius: 0.75rem;
        background: #e9ecef;

        &:nth-child(1) {
            width: 80%;
        }

        &:nth-child(2) {
            width: 60%;
        }

        &:nth-child(3) {
            width: 40%;
        }
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }

        100% {
            transform: translateX(100%);
        }
    }
</style>

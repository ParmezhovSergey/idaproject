<script setup lang="ts">
    // #region Imports
    // Utils
    import { remToPx } from '~/utils/common-utils';

    // Pinia
    import { useHeaderStore } from '@/store/headerStore.ts';

    // Components
    import LogoIda from '@/components/common/LogoIda.vue';
    // #endregion

    // #region Interfaces
    interface IHeaderData {
        isTicking: boolean;
        lastScroll: number;
        isInit: boolean;
    }
    // #endregion

    // #region Data
    const $style = useCssModule();
    const headerStore = useHeaderStore();

    const data: IHeaderData = reactive({
        burgerIntersection: false,
        isTicking: false,
        lastScroll: 0,
        isInit: false,
    });
    // #endregion

    // #region Methods
    const handleCheckMenu = async () => {
        if (headerStore.isBurgerMenuVisible) {
            return;
        }

        const styleRecords = {
            Desktop: '7.2rem',
            Tablet: '6.8rem',
            Mobile: '6.4rem',
        };

        const menuHeightRem = styleRecords['Desktop'];
        const isMoreMenuHeight =
            document.documentElement.scrollTop >= remToPx(menuHeightRem || '7.2rem');

        if (headerStore.isMenuWithHero) {
            headerStore.setTransparent(!isMoreMenuHeight);
        }

        if (isMoreMenuHeight) {
            if (document.documentElement.scrollTop > data.lastScroll) {
                if (headerStore.isVisible) {
                    headerStore.changeVisibility(false);
                }
            } else if (!headerStore.isVisible) {
                headerStore.changeVisibility(true);
            }
            data.lastScroll = document.documentElement.scrollTop;
        } else {
            headerStore.changeVisibility(true);
        }
    };

    const handleUpdateState = async () => {
        await Promise.all([
            headerStore.setScrolled(document.documentElement.scrollTop >= 1),
            handleCheckMenu(),
        ]);

        data.isTicking = false;
    };

    // scheduleUpdate decorator for onScroll
    const scheduleUpdate = (() => {
        let frameId: number | null = null;
        return () => {
            if (frameId !== null) return;
            frameId = requestAnimationFrame(() => {
                handleUpdateState().finally(() => {
                    frameId = null;
                });
            });
        };
    })();

    function onScroll() {
        scheduleUpdate();
    }
    // #endregion

    // #region Computed
    const classList = computed(() => [
        {
            [$style._transparent]: headerStore.isTransparent,
            [$style._scrolled]:
                headerStore.isScrolled &&
                headerStore.isVisible &&
                !headerStore.isTransparent &&
                !headerStore.isBurgerMenuVisible,
            [$style._hidden]: !headerStore.isVisible && !headerStore.isBurgerMenuVisible,
        },
    ]);
    // #endregion

    // #region Lifecycle
    onMounted(() => {
        nextTick(() => {
            data.lastScroll = document.documentElement.scrollTop;
            window.addEventListener('scroll', onScroll);
        });
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', onScroll);
    });
    // #endregion
</script>

<template>
    <header :class="[$style.TheHeader, classList, 'js-header']">
        <div :class="['container', $style.wrapper]">
            <LogoIda
                color="white"
                to="/"
            />

            <div :class="$style.wrapperCenter"></div>
        </div>
    </header>
</template>

<style lang="scss" module>
    .TheHeader {
        position: fixed;
        top: 0;
        z-index: $header-z-index;
        width: 100%;
        height: $header-h;
        background: $base-900;
        transition:
            background-color $default-transition,
            box-shadow $default-transition,
            transform 0.3s linear;
        box-shadow: 0 0.2rem 0.8rem rgba(0 0 0 / 0%);

        &._transparent {
            background-color: transparent;
            box-shadow: none;
        }

        &._scrolled {
            box-shadow: 0 8px 8px rgba(0 0 0 / 8%);
        }

        &._hidden {
            transform: translateY(-100%);
        }

        &:after {
            content: '';
            position: absolute;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 1px;
            background-color: $base-300;
        }
    }

    .wrapper {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        height: $header-h;
    }

    .wrapperCenter {
        flex: 1;
    }
</style>

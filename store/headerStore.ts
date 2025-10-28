import { defineStore } from 'pinia';

export interface IHeaderState {
    isScrolled: boolean;
    isVisible: boolean;
    isTransparent: boolean;
    isMenuWithHero: boolean;
    isBurgerMenuVisible: boolean;
}

export const useHeaderStore = defineStore('header', function () {
    // State
    const isScrolled = ref<IHeaderState['isScrolled']>(false);
    const isVisible = ref<IHeaderState['isVisible']>(true);
    const isTransparent = ref<IHeaderState['isTransparent']>(false);
    const isMenuWithHero = ref<IHeaderState['isMenuWithHero']>(false);
    const isBurgerMenuVisible = ref<IHeaderState['isBurgerMenuVisible']>(false);

    // Actions
    function setScrolled(val: boolean) {
        isScrolled.value = val;
    }

    function changeVisibility(val: boolean) {
        isVisible.value = val;
    }

    function setTransparent(val: boolean) {
        isTransparent.value = val;
    }

    return {
        isScrolled,
        isVisible,
        isTransparent,
        isMenuWithHero,
        isBurgerMenuVisible,
        setScrolled,
        changeVisibility,
        setTransparent,
    };
});

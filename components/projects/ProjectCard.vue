<script setup lang="ts">
    // #region Imports
    // Types
    // #endregion

    // #region Interfaces
    interface IProject {
        id: number;
        address: string;
        name: string;
        price: number;
        image_display: string;
    }

    interface Props {
        project?: IProject;
        isLoader?: boolean;
    }
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<Props>(), {
        project: undefined,
        isLoader: false,
    });
    // #endregion
    // #region Data
    const isReloading = ref(false);
    const showButtons = ref(false);
    // #endregion
</script>

<template>
    <div
        :class="['project-card', $style.ProjectCard, { [$style._loading]: isLoader }]"
        @mouseenter="showButtons = true"
        @mouseleave="showButtons = false"
    >
        <div
            v-if="props.isLoader || !props.project"
            :class="$style.cardWrapper"
            class="card-wrapper"
        ></div>

        <template v-else>
            <div :class="[$style.cardWrapper, { [$style._reload]: isReloading }]">
                <!--                <Transition name="fade-fast">-->
                <!-- TODO: 4. Сверстать карточку -->
                <img
                    :src="props.project.image_display"
                    alt="Image of the project"
                    :class="$style.image"
                />
                <div :class="$style.content">
                    <h3 :class="$style.name">{{ props.project.name }}</h3>
                    <p :class="$style.address">г. {{ props.project.address }}</p>
                    <p :class="$style.price">квартиры от {{ props.project.price }} ₽</p>
                    <div v-if="showButtons">
                        <button :class="$style.button">подробнее о проекте</button>
                        <button :class="$style.button">квартиры проекта</button>
                    </div>
                </div>

                <!--                </Transition>-->
            </div>
        </template>
    </div>
</template>

<style lang="scss" module>
    .ProjectCard {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-grow: 1;
        width: 33.3%;
        height: 50rem;
        padding: 0.8rem;
        user-select: none;
        flex: 0 0 auto;

        &:nth-child(-n + 3) {
            flex-grow: 0;
        }

        &._loading {
            .cardWrapper {
                &:after {
                    content: '';
                    position: absolute;
                    top: -110%;
                    left: -210%;
                    width: 200%;
                    height: 200%;
                    /* stylelint-disable */
                    background: linear-gradient(
                        to right,
                        rgba(255, 255, 255, 0.13) 0%,
                        rgb(255 255 255 / 13%) 77%,
                        rgb(255 255 255 / 50%) 92%,
                        rgb(255 255 255 / 0%) 100%
                    );
                    /* stylelint-enable */
                    opacity: 0;
                    transform: rotate(30deg);
                    animation: shine 2s ease-out infinite;
                    animation-fill-mode: forwards;
                }
            }
        }

        &:hover {
            .cardWrapper {
                border-radius: 5.6rem;
            }
        }

        @include respond-to(tablet) {
            width: 50%;
            height: 42rem;
            padding: 0.6rem;

            &:hover {
                .cardWrapper {
                    border-radius: 0;
                }
            }
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

        @keyframes shine {
            10% {
                top: -30%;
                left: -30%;
                opacity: 1;
                transition-duration: 0.7s, 0.7s, 0.15s;
                transition-property: left, top, opacity;
                transition-timing-function: ease;
            }

            100% {
                top: -30%;
                left: -30%;
                opacity: 0;
                transition-property: left, top, opacity;
            }
        }
    }

    .cardWrapper {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
        border-radius: 0.5rem;
        background-position: center;
        background-size: cover;
        transform: translate3d(0, 0, 0);
        transition:
            border-radius 0.2s linear,
            filter 0.2s ease-in;

        &._reload {
            filter: blur(1px);
        }
    }

    .image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        object-fit: cover;
        border-radius: inherit;
    }

    .content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        color: white;
        text-align: start;
        z-index: 2;
    }

    .name {
        font-size: 36px;
        font-weight: 500;
        margin-bottom: 8px;
    }

    .address {
        font-size: 14px;
        margin-bottom: 20px;
    }

    .price {
        font-size: 22px;
        font-weight: 300;
        margin-bottom: 15px;
    }

    .button {
        background-color: transparent;
        border: 1px solid white;
        color: white;
        padding: 8px 16px;
        border-radius: 15px;
        margin-right: 10px;
        margin-top: 5px;
        font-size: 18px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: white;
            color: black;
        }
    }
</style>

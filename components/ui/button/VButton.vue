<template>
    <component
        :is="tag"
        :data-test-id="name"
        :class="[$style.VButton, classList]"
        :disabled="disabled"
        v-bind="$attrs"
        @click="onClick"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <div
            v-if="$slots.default"
            :class="$style.label"
        >
            <!-- @slot Контент внутри кнопки -->
            <slot></slot>
        </div>
    </component>
</template>

<script setup lang="ts">
    /**
     * Кастомная альтернатива тега button в стандартном html<br>
     * На проектах, обычно, имеет несколько цветов, форм и состояний.<br><br>
     * Область применения: ссылка, изменения состояния, вызов методов.
     */

    // #region Imports
    // Types
    import type { IButtonProps } from './types';
    // #endregion

    // #region Props
    const props = withDefaults(defineProps<IButtonProps>(), {
        name: '',
        tag: 'button',
        size: 'medium',
        color: 'base',
        border: true,
        round: false,
        active: false,
        disabled: false,
    });
    // #endregion

    // #region Emits
    const emit = defineEmits(['click', 'mouseenter', 'mouseleave']);
    // #endregion

    // #region Data
    const $style = useCssModule();
    // #endregion

    // #region Methods
    const onClick = ($event) => {
        emit('click', $event);
    };

    const onMouseEnter = ($event) => {
        emit('mouseenter', $event);
    };

    const onMouseLeave = ($event) => {
        emit('mouseleave', $event);
    };
    // #endregion

    // #region Computed
    const classList = computed(() => [
        {
            [$style[`_${props.color}`]]: props.color,
            [$style[`_${props.size}`]]: props.size,
            [$style._disabled]: props.disabled,
            [$style._active]: props.active,
            [$style._border]: props.border,
            [$style._round]: props.round,
        },
    ]);
    // #endregion
</script>

<style lang="scss" module>
    $base-black: $base-600;
    $base-white: #fff;

    /* Colors */
    // base
    $base-color: $violet;

    // Black
    $black-active: $base-100;

    .VButton {
        outline: none;
        transition:
            color $default-transition,
            opacity $default-transition,
            background-color $default-transition,
            border-color $default-transition;
        cursor: pointer;
        user-select: none;

        /* Modificators */
        &._border {
            overflow: hidden;
            border-style: solid;
            border-width: 0.1rem;
        }

        &._round {
            border-radius: 10rem;
        }

        &._disabled {
            pointer-events: none;
            opacity: 0.5;
        }

        &:hover {
            opacity: 0.7;
        }

        /* Sizes */
        &._small {
            .label {
                padding: 1rem 1.6rem;
            }
        }

        &._medium {
            .label {
                padding: 1.4rem 3.2rem;

                @include respond-to(mobile) {
                    padding: 1.2rem 3.2rem;
                }
            }
        }

        /* Colors */
        &._base {
            background-color: $base-white;

            .label {
                color: $base-black;
            }

            &._active {
                .label {
                    color: $base-color;
                }

                &._border {
                    border-color: $base-color;
                }
            }

            @include hover {
                &._border {
                    border-color: $base-color;
                }
            }
        }

        &._fill {
            background-color: $base-white;

            .label {
                color: $base-black;
            }

            &._active {
                background-color: $base-color;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-color;
                }
            }

            @include hover {
                &._border {
                    border-color: $base-color;
                }
            }
        }

        &._dark {
            border-color: $black-active;
            background-color: $base-black;

            .label {
                color: $base-white;
            }

            &._active {
                background-color: $black-active;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $black-active;
                }
            }

            @include hover {
                &._border {
                    border-color: $black-active;
                }
            }
        }

        &._darkFill {
            background-color: transparent;

            .label {
                color: $base-white;
            }

            &._border {
                border-color: $base-white;
            }

            &._active {
                background-color: $base-color;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-color;
                }
            }

            @include hover {
                background-color: $base-color;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-color;
                }
            }
        }

        &._black {
            background-color: $base-white;

            .label {
                color: $base-black;
            }

            &._active {
                background-color: $base-black;

                .label {
                    color: $base-white;
                }

                &._border {
                    border-color: $base-black;
                }
            }

            @include hover {
                &._border {
                    border-color: $base-black;
                }
            }
        }
    }

    .label {
        display: inline-flex;
        align-items: baseline;
        text-transform: uppercase;
        white-space: nowrap;
        font-size: 1.2rem;
        line-height: 1.2;
        letter-spacing: -0.005em;
        transition: color $default-transition;

        svg {
            position: relative;
            top: 0.125em;
            display: inline-block;
            width: 1em;
            height: 1em;
            margin-left: 0.2em;
            vertical-align: center;
        }
    }
</style>

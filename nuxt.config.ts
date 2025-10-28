import { defineNuxtConfig } from 'nuxt/config';
import headConfig from './config/headConfig.js';
import nuxtDevConfig from './nuxt.dev.config';
import nuxtProdConfig from './nuxt.prod.config';
const isDev = process.env.NODE_ENV === 'development';

export default defineNuxtConfig({
    ...(isDev ? nuxtDevConfig : nuxtProdConfig),

    app: {
        // @ts-expect-error Export config
        head: headConfig,
    },

    router: {
        options: {
            linkActiveClass: '_active-link',
            linkExactActiveClass: '_exact-link',
        },
    },

    runtimeConfig: {
        public: {
            IS_DEV: process.env.NODE_ENV === 'development',
        },
    },

    // @nuxt/icon
    icon: {
        localApiEndpoint: '/icons-api/_nuxt_icon',
        mode: 'svg',
        customCollections: [
            {
                prefix: 'icons',
                dir: './assets/icons',
            },
        ],
    },

    // Auto import UI components
    components: [
        {
            path: '~/components/ui',
            global: true,
            pathPrefix: false,
            extensions: ['.vue'],
        },
    ],

    // CSS
    css: ['~/assets/scss/bundle.scss', '~/assets/scss/vendors.scss', '~/assets/scss/default.scss'],

    // Vite configuration for SCSS
    vite: {
        optimizeDeps: {
            exclude: isDev ? ['@vueuse/core', '@fluejs/noscroll'] : [],
        },

        server: {
            hmr: {
                clientPort: 3000,
            },
        },

        vue: {
            script: {
                propsDestructure: true,
            },
        },

        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                    additionalData: `
                        @use "assets/scss/shared/variables" as *;
                        @use "assets/scss/shared/functions" as *;
                        @use "assets/scss/shared/mixins" as *;
                    `,
                },
            },
        },

        build: {
            cssCodeSplit: false,
            cssMinify: 'esbuild',
        },
    },
});

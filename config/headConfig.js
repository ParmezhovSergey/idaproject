const headConfig = {
    htmlAttrs: { lang: 'ru' },

    title: 'IDA Test task',

    // Head meta
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#111' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'msapplication-TileColor', content: '#1a1b1d' },
    ],

    // Head links
    link: [
        // Favicons
        {
            rel: 'icon',
            href: '/favicons/favicon.ico',
        },
        {
            rel: 'apple-touch-icon',
            href: '/favicons/apple-touch-icon.png',
            sizes: '180x180',
        },
        {
            rel: 'icon',
            href: '/favicons/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
        },
        {
            rel: 'icon',
            href: '/favicons/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
        },
        {
            rel: 'manifest',
            href: '/favicons/site.webmanifest',
            crossorigin: 'use-credentials',
        },
        {
            rel: 'mask-icon',
            href: '/favicons/safari-pinned-tab.svg',
            color: '#1a1b1d',
        },
    ],
};

export default headConfig;

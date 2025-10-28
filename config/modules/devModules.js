const devModules = [
    [
        '@nuxtjs/stylelint-module',
        {
            cache: false,
            emitError: true,
            emitWarning: true,
            throwOnError: false,
            throwOnWarning: false,
            failOnWarning: false,
            failOnError: false,
            lintOnStart: false,
            emitErrorAsWarning: true,
        },
    ],

    ['@nuxt/eslint', { cache: false }],
];
export default devModules;

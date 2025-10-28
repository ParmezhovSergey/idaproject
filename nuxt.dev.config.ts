import commonModules from './config/modules/commonModules';
import devModules from './config/modules/devModules';

const nuxtDevConfig = {
    // Local server settings
    typescript: {
        typeCheck: true,
    },

    devServer: {
        port: 3000,
        host: '0.0.0.0',
        https: false,
    },

    devtools: { enabled: true },

    modules: [...commonModules, ...devModules],

    // Stylelint options
    stylelint: {
        files: [
            'assets/**/*.{s?(a|c)ss}',
            '**/components/**/*.{s?(a|c)ss}',
            '**/{components,layouts,services,pages}/**/*.vue',
        ],
    },

    // Eslint options
    eslint: {
        cache: false,
        checker: true,
    },
};

export default nuxtDevConfig;

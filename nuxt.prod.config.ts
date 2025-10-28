import commonModules from './config/modules/commonModules';
import prodModules from './config/modules/prodModules';

const nuxtProdConfig = {
    sourcemap: {
        server: false,
        client: false,
    },

    nitro: {
        sourceMap: false,
    },

    modules: [...commonModules, ...prodModules],

    // Polyfills
    polyfill: {
        features: [],
    },
};

export default nuxtProdConfig;

const path = require('path')

/**
 * @param {import('webpack').Configuration} defaultOptions
 * @returns {import('webpack').Configuration}
 */
module.exports = (defaultOptions) => {
    /**
     * @type {import('webpack').Configuration}
     */
    const config = {
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
            modules: [path.join(__dirname, './src'), 'node_modules']
        }
    }

    return config
}
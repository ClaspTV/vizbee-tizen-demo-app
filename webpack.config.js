const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    mode: 'development',  // This prevents default minification
    optimization: {
        minimize: false  // This explicitly disables minification
    },
    devtool: 'source-map',  // This generates source maps for better debugging
    module: {
        rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: path.resolve('.', '.', 'index.html'),
                    to: path.resolve('.', 'build', 'index.html')
                },
                { 
                    from: path.resolve(__dirname, 'images'), 
                    to: path.resolve(__dirname, 'build', 'images') 
                },
                { 
                    from: path.resolve(__dirname, 'fonts'), 
                    to: path.resolve(__dirname, 'build', 'fonts') 
                },
                { 
                    from: path.resolve(__dirname, 'css'), 
                    to: path.resolve(__dirname, 'build', 'css') 
                },
                { 
                    from: path.resolve('.', '.', 'config.xml'),
                    to: path.resolve('.', 'build', 'config.xml')
                },
            ],
        }),
    ]
};
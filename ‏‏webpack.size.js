const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
    entry: './src/index.js',
    mode: 'development',
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]

    },
    plugins: [
        new BundleAnalyzerPlugin()
    ],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'dev.bundle.js'
    }
};
const path = require('path');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')


module.exports = {
    entry: './src/index.js',
    mode: 'development',
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]

    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'dev.bundle.js'
    },
    plugins:[
        new WorkboxWebpackPlugin.InjectManifest({
            swSrc:'./src/sw.js',
            swDest:'sw.js'
        })
    ]
};
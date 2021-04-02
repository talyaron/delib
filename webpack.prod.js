const path = require('path');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    mode: 'production',
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
        filename: 'prod.bundle.js'
    },
    plugins:[
        new WorkboxWebpackPlugin.InjectManifest({
            swSrc:'./src/sw.js',
            swDest:'sw.js'
        })
    ]

};
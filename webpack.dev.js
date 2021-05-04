const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


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
                    presets: ['@babel/preset-env'],
                    plugins: [
                        ["@babel/plugin-transform-react-jsx", {
                            "pragma": "m",
                            "pragmaFrag": "'['"
                        }]
                    ]
                }
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
    }
  
    
};
// webpack 默认配置
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 压缩 Css 文件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

// 用于处理多路径文件，使用purifycss的时候要用到glob.sync方法。
const glob = require('glob-all')
// Css tree shanking 摇树
const purifyCssWebpack = require('purifycss-webpack')

// 引入js到 html 文件中
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, './src/react.js'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main_[hash:8].js'
    },
    // mode: 'development',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css|less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            //  您可以在此处指定publicPath
                            //  默认情况下，它在webpackOptions.output中使用publicPath
                            publicPath: '../'
                        }
                    }, 'css-loader', 'postcss-loader', 'less-loader'
                ],
                // 这里会直接到 src 文件下找 less/css 文件进行编译，这里是项目优化的一个小技巧
                include: path.resolve(__dirname, './src')
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {},
                    },
                ],
            },
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
        ]
    },
    plugins: [
        // 复制一个 html 并将最后打包好的资源在 html 中引入
        new htmlWebpackPlugin({
            // 页面title 需要搭配 ejs 使用
            title: "webpack-react",
            // html 模板路径
            template: "./index.html",
            // 输出文件名称
            filename: "index.html",
            minify: {
                // 压缩HTML⽂件
                removeComments: true, // 移除HTML中的注释
                collapseWhitespace: true, // 删除空⽩符与换⾏符
                minifyCSS: true // 压缩内联css
            }
        }),
        // 每次部署时清空 dist 目录
        new CleanWebpackPlugin(),
        // 启用模块热替换(HMR - Hot Module Replacement)
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/[name]_[contenthash:6].css",
        }),
        // 压缩css文件
        new OptimizeCssAssetsWebpackPlugin({
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
                // 去掉注释
                preset: ["default", { discardComments: { removeAll: true } }]
            }
        }),
        new purifyCssWebpack({
            paths: glob.sync([
                path.resolve(__dirname, './src/*html'),
                path.resolve(__dirname, './src/*js')
            ])
        }),
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, './dll/react-manifest.json')
        }),
        new AddAssetHtmlWebpackPlugin({
            filepath: path.resolve(__dirname, './dll/react.dll.js')
        })
    ],
    devtool: 'cheap-module-eval-source-map',
    optimization: {
        // js 开启 tree shanking
        usedExports: true,
        splitChunks: {
            chunks: "all", // 代码分隔 公共代码分离出来
            name: true,
            cacheGroups: {
                react: {
                    test: /[\\/]react|react-dom[\\/]/,
                    name: 'react'
                },
                lodash: {
                    test: /[\\/]lodash[\\/]/,
                    name: 'lodash'
                }
            }
        }
    },
    resolve: {
        // 规定在那里寻找第三方模块
        modules: [path.resolve(__dirname, './node_modules')],
        // 别名
        alias: {
            react: path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js'),
            '@': path.resolve(__dirname, './src')
        },
        // 自动补齐后缀名
        extensions: ['.js', '.jsx']
    },
    // // 启动项目
    devServer: {
        contentBase: './dist',
        open: true,
        port: 8081,
        hot: true,
        hotOnly: true
    },
}
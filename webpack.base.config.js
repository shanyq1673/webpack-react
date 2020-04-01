// webpack 默认配置
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Happypack = require('happypack');
//构造出一个共享进程池，在进程池中包含4个子进程
const happyThreadPool = Happypack.ThreadPool({
    size: 4
})

module.exports = {
    entry: path.resolve(__dirname, './src/react.js'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main_[hash:8].js'
    },
    module: {
        rules: [
            {
                test: /\.css|less$/,
                use: ['Happypack/loader?id=happypackCss'],
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
                use: 'Happypack/loader?id=happypackJs',
                include: path.resolve(__dirname, './src')
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
        new MiniCssExtractPlugin({
            filename: "css/[name]_[contenthash:6].css",
        }),
        new Happypack({
            // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
            id: 'happypackJs',
            // 如何处理 .js 文件，用法和 Loader 配置中一样
            use: ['babel-loader'],
            //使用共享进程池中的自进程去处理任务
            threadPool: happyThreadPool,
            //是否允许happypack输出日志，默认true
            verbose: true
        }),
        new Happypack({
            // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
            id: 'happypackCss',
            // 如何处理 .css 文件，用法和 Loader 配置中一样
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
            //使用共享进程池中的自进程去处理任务
            threadPool: happyThreadPool,
        })
    ],
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
}
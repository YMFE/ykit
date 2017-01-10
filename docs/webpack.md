由于 Ykit 是基于 Webpack 的，因此迁移 Webapck 项目只需要原有配置进行迁移。

<h2 style="font-weight: normal"> 1. 安装 qunar 插件 </h2>

在项目中执行

```sh
npm i @qnpm/ykit-config-qunar --registry http://registry.npm.corp.qunar.com/ --save
```

<h2 style="font-weight: normal"> 2. 创建 ykit 配置文件 </h2>

在项目目录下创建一个名为 `ykit.qunar.js` 的配置文件，示例：

```javascript
exports.config = function() {
    return {
        // ykit 中没有 entry 和 output 的概念，而是使用 export
        // 在本地服务请求时，会实现 /src -> /prd 目录的对应(类似 fekit)
        // 比如请求 /prd/script/index.js，则会编译 /src/script/index.js 并返回编译结果
        export: ['./scripts/index.js', './styles/index.scss'],

        // 通过 modifyWebpackConfig 可以获取 ykit 基础的 webpack 配置（baseConfig）并进行修改
        // 具体更改哪些配置项参照下方的配置表
        modifyWebpackConfig: function(baseConfig) {
            // ...
            return baseConfig
        }
    }
};
```

<h2 style="font-weight: normal"> 3. 配置 modifyWebpackConfig </h2>

modifyWebpackConfig 提供了在 ykit 基础上定制化配置的能力，详见下表：

| config 字段 | 环境 |ykit 默认配置 | 是否支持业务自定义 |
| :----------- | :-- |:---------- | :---- |
| context      | - | src         | 支持 |
| entry        | - | 无           | 支持 |
| output.path | local | prd | 不建议自定义 |
|  | dev | dev | 不建议自定义，由开发机指定 |
|  | prd | prd | 不建议自定义，由发布系统指定 |
| output.filename | local | [name][ext] | 支持 |
|  | dev | [name]@dev[ext] | 支持 |
|  | prd | [name]@[chunkhash][ext] | 支持 |
| output.chunkFilename | local | [id].chunk.js | 支持 |
|  | dev | [id].chunk@dev[ext] | 支持 |
|  | prd | [id].chunk@[chunkhash][ext] | 支持 |
| module.loaders | - | css, sass, less, html, json | 支持 |
| resolve.alias | - | 无 | 支持 |
| resolve.extensions | - | .js, .css, .json, .tpl, .string, .scss, .sass, .less | 支持 |
| devtool | local & dev | cheap-source-map | 支持 |
| plugins | prd | UglifyJsPlugin | 支持 |

需要注意的是，不同的配置项要根据当前 ykit 默认来选择**赋值、追加或者合并**操作，以下是简单示例：

```javascript
exports.config = function() {
    return {
        export: ['./scripts/index.js', './styles/index.scss'],

        // 通过 modifyWebpackConfig 可以获取 ykit 基础的 webpack 配置（baseConfig）并进行修改
        // 具体更改哪些配置项参照下方的配置表
        modifyWebpackConfig: function(baseConfig) {

            // 设置 alias
            baseConfig.resolve.alias = {
                'Utils': '/src/scripts/utils',
                'Plugin': '/src/scripts/plugin',
                'Config': '/src/scripts/config'
            };

            // 追加 loaders
            baseConfig.module.loaders.push ({
                test: /\.js|jsx$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: [
                        'babel-preset-es2015',
                        'babel-preset-react'
                    ]
                }
            });

            // 更改不同环境的 output.filename
            baseConfig.output.local.filename = '[name][ext]';
            baseConfig.output.dev.filename = '[name]@dev[ext]';
            baseConfig.output.prd.filename = '[name]@[chunkhash][ext]';

            return baseConfig;
        }
    }
};
```

<h2 style="font-weight: normal"> 4. 验证 </h2>

可针对不同环境，通过本地服务和编译打包资源进行验证

- local环境: 在项目外执行 `(sudo) ykit server`，通过本地服务验证资源
- dev环境: 在项目中执行 `ykit pack`，资源将被打到 dev 目录下（版本号统一为 @dev）
- prd环境: 在项目中执行 `ykit pack -m`，资源将被打到 prd 目录下（带 hash 版本号）

[1]: ./docs-配置.html

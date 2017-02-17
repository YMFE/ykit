# 配置

Ykit 在每一个项目中都有一个单一的配置文件 `ykit.js`。通过该文件可以灵活地扩展和配置你的项目。对于一般项目而言，有这些需要进行配置：

- **plugins** - 指定引入的插件列表。插件会扩展项目的配置、命令等，可以帮助快速搭建特定的开发环境。
- **config** - 项目的配置对象，通过它可以操作资源入口和 Webpack 配置。
- **hooks** - 打包过程中的钩子。
- **commands** - 自定义命令，如构建、测试脚本等。

## plugins

Ykit 插件是对一类配置和功能的封装。每一个插件都是一个 NPM 模块，命名规则为 `ykit-config-<name>`，比如 `ykit-config-yo`。

首先通过 NPM 安装相应插件：

```
$ npm install --save ykit-config-yo
```

之后配置 `ykit.js`，传入一个插件名的数组来引入插件。这些插件将在 Ykit 执行前加载进来。如果有相同的配置，后面的插件会覆盖前面的。

```javascript
module.exports = {
    plugins: ['yo', 'react']
    // ...
};
```

更多信息和插件列表详见 [Ykit 文档-插件][3]。

## config

### exports

通过该配置项可指定资源入口路径。

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        // 基于当前源代码目录，默认为 "src"
        exports: [
            './scripts/index.js', // 引入 <project_path>/src/scripts/index.js
            './styles/index.scss' // 引入 <project_path>/src/styles/index.scss
        ],
    }
    // ...
};
```

在 Ykit 中，会实现打包目录（默认为 `prd`）至源目录（默认为 `src`）的对应。比如当 Ykit 本地 server 接收到 `/prd/script/index.js` 的请求，则会编译 `/src/script/index.js` 并返回编译结果。

### modifyWebpackConfig

通过该配置项，你可以传入一个函数对当前的 Webpack 配置（`baseConfig`）进行修改。

- 示例 - 添加 loaders：

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        exports: ['./scripts/app.js'],
        modifyWebpackConfig: function(baseConfig) {
            // 注意使用进行追加方法，而不要覆盖掉之前的
            baseConfig.module.loaders = baseConfig.module.loaders.concat([
                // 自定义 plugins...
                {
                    test: /\.mustache$/,
                    loader: 'mustache'
                }
            ])
            return baseConfig;
        }
    }
};
```

- 示例 - 替换 loaders：

如果是当前配置中已经存在 loader，则要进行替换操作：

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        exports: ['./scripts/app.js'],
        modifyWebpackConfig: function(baseConfig) {
            // 替换处理 scss 原有的 loader
            baseConfig.module.loaders = baseConfig.module.loaders
                .map(function (loader) {
                    if (loader.test.toString().match(/scss/)) {
                        return {
                            test: /\.(sass|scss)$/,
                            loader: 'style-loader!css-loader!sass-loader'
                        };
                    }
                    return loader;
                })

            return baseConfig;
        }
    }
};
```

- 示例 - 添加 plugins：

```javascript
var myPlugin = require('myPlugin');
module.exports = {
    plugins: ['qunar'],
    config: {
        exports: ['./scripts/app.js'],
        modifyWebpackConfig: function(baseConfig) {
            baseConfig.plugins = baseConfig.plugins.concat([
                myPlugin
            ])
            return baseConfig;
        }
    }
};
```

### modifyWebpackConfig 上下文

在 `modifyWebpackConfig` 函数中从 this 可以获取到以下属性。

- webpack: 当前 ykit 内部 webapck 实例。

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        exports: ['./scripts/app.js'],
        modifyWebpackConfig: function(baseConfig) {
            baseConfig.plugins = baseConfig.plugins.concat([
                // 通过 this.webpack 可获取到 Webpack 实例
                new this.webpack.optimize.DedupePlugin()
            ])
            return baseConfig;
        }
    }
};
```

- env: 当前 ykit 的执行环境，可用的环境有：

    - local - 本地环境配置，在 ykit server 中访问项目会生效
    - dev - 开发环境配置，在 ykit pack 时生效
    - prd - 生产环境配置，在 ykit pack -m 时生效

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        exports: ['./scripts/app.js'],
        modifyWebpackConfig: function(baseConfig) {
            // 根据环境修改配置
            switch (this.env) {
                case 'local':
                    break;
                case 'dev':
                    break;
                case 'prd':
                    break;
                default:
            }

            return baseConfig;
        }
    }
};
```

## hooks

Ykit 允许项目在打包过程中添加钩子，可在不同的阶段对资源进行处理。

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        // ...
    },
    hooks: {
        // 传入一个函数
        beforePack: function() {
            console.log('Do sth before Ykit Pack!');
        },
        // 传入一个函数数组
        afterPack: [
            function() {
                console.log('Do sth after Ykit Pack!');
            },
            function() {
                // 添加异步钩子
                var callback = this.async();
                console.log('Do sth async after Ykit Pack!');
                callback();
            }
        ]
    }
};
```

## commands

Ykit 允许你添加自定义命令，功能类似于 `npm scripts`，添加形式如下：

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        exports: ['./scripts/app.js'],
        modifyWebpackConfig: function(baseConfig) {
            return baseConfig;
        }
    },
    commands: [{
        name: 'mycmd',
        module: {
            usage: '输出 “abcde”',
            run: function () {
                console.log('abcde');
            }
        }
    }]
};
```

此时你就可以在控制台中执行它。

```
$ ykit mycmd
```

[1]: https://webpack.github.io/docs/configuration.html
[2]: https://github.com/survivejs/webpack-merge
[3]: ./plugins.html

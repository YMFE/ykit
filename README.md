<h1 style="font-weight: normal"> Ykit </h1>

Ykit 是一套可配置和可扩展的前端开发工具集，核心功能包括资源打包、静态资源服务、代码质量检测。Ykit 基于 [webpack][1]，支持 CommonJs, AMD, ES6 modules, Coffeescript, CSS, SASS, LESS 等模块类型的打包。

Ykit 的初衷在于快速搭建不同的开发环境。它提供一个可靠的基础配置，通过可插拔的插件来进行扩展（编译插件、服务中间件、工具和命令...），并让开发者可以灵活地根据不同项目来修改配置。

详细文档请查看 [http://ued.qunar.com/ykit/docs.html][3]

<h2 style="font-weight: normal"> Features </h2>

- 本地静态资源服务
- 一键配置的开发环境
- 自带 lint 工具和预设规则
- 自带代理工具，可实现 SwitchHost + Charles 的基本功能

<h2 style="font-weight: normal"> Install </h2>

```
(sudo) npm install ykit -g
```

<h2 style="font-weight: normal"> Usage </h2>

<h3 style="font-weight: normal"> Init </h3>

通过 init 命令快速搭建一个项目脚手架：

1. 创建一个项目目录
2. 进入目录执行 `ykit init [<type>]`

初始化时可以选择项目类型（type 留空则为基础脚手架），目前支持的初始化类型：

- yo
- qunar

<h3 style="font-weight: normal"> Server </h3>

在项目目录外执行命令：

```
(sudo) ykit server // 或者使用缩写 ykit s
```

访问 `localhost/项目目录/index.html`

<h3 style="font-weight: normal"> Pack </h3>

在项目中执行命令：

```
ykit pack -m
```

将会对资源进行编译打包压缩，默认会打到 `prd` 目录。

<h2 style="font-weight: normal"> 配置 ykit.{type}.js </h2>

项目中的配置文件。其中 type 指的是当前项目环境的名称。比如 `ykit.js`（基础环境）、`ykit.yo.js` 或者 `ykit.qunar.js`。配置文件样例：

```js
exports.config = function() {
    return {
        // 在本地服务请求时，会实现 /src -> /prd 目录的对应(类似 fekit)
        // 比如请求 /prd/script/index.js，则会编译 /src/script/index.js 并返回编译结果
        export: ['./scripts/index.js', './styles/index.scss'],

        // 通过 modifyWebpackConfig 可以获取 ykit 基础的 webpack 配置（baseConfig）并进行修改
        modifyWebpackConfig: function(baseConfig) {
            // ...
            return baseConfig
        }
    }
};
```

详细配置请参考 [ykit-配置][4]。

<h2 style="font-weight: normal"> Changelog </h2>

[Changelog][2]

[1]: https://github.com/webpack/webpack
[2]: ./releases.html
[3]: http://ued.qunar.com/ykit/docs.html
[4]: http://ued.qunar.com/ykit/docs-%E9%85%8D%E7%BD%AE.html

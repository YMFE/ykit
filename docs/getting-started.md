<h1 style="font-weight: normal"> 起步 </h1>

<h2 style="font-weight: normal"> 安装 Ykit </h2>

```bash
$ (sudo) npm install ykit -g
```

如果想体验最新的特性，也可以安装 rc 版本

```bash
$ (sudo) npm install ykit@rc -g
```

<h2 style="font-weight: normal"> 初始化一个项目 </h2>

<h3 style="font-weight: normal"> Init </h3>

通过 init 命令可以快速搭建一个项目脚手架：

1. 创建一个项目目录
2. 进入目录执行 `ykit init qunar` (这里以初始化 qunar 项目为例)

初始化时可以选择项目类型（init 后面接的参数），目前支持的初始化类型：

- qunar
- yo

<h3 style="font-weight: normal"> Server </h3>

在项目目录外执行命令：

```
(sudo) ykit server // 或者使用缩写 ykit s
```

访问 `localhost/<项目目录>/index.html` 即可。

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

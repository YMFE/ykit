# 起步

## 安装 Ykit

```bash
$ (sudo) npm install ykit -g
```

如果想体验最新的特性，也可以在安装时添加 rc tag 来获取提前预览版。

```bash
$ (sudo) npm install ykit@rc -g
```

## 初始化一个项目

### Init

通过 init 命令可以快速搭建一个项目脚手架：

1. 创建一个项目目录。
2. 进入目录执行 `ykit init qunar` (这里以初始化 qunar 项目为例)。

### Server

在项目目录外执行命令：

```
(sudo) ykit server // 或者使用缩写 ykit s
```

访问 `localhost/<项目目录>/index.html` 即可。

## 配置

初始化完成后会在项目中生成一个 `ykit.js`，有类似下面的配置：

```javascript
module.exports = {
    plugins: ['qunar'],
    config: {
        export: ['./scripts/index.js', './styles/index.scss'],
        modifyWebpackConfig: function(baseConfig) {
            return baseConfig;
        }
    }
};
```

- **plugins** - 当前引入的插件。因为我们初始化的是 qunar 项目，所以会自动引入相应插件。根据需求还可以安装和引入更多插件。
- **config** - 配置对象。主要包含两部分：
    - **exports** - 资源的入口路径。
    - **modifyWebpackConfig** - 通过该函数可以对当前 Webpack 配置（`baseConfig`）进行修改。

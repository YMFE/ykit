<h1 style="font-weight: normal"> 迁移已有项目到 Ykit </h1>

Ykit 将各种功能和兼容特性封装成了插件，因此选择适合项目的插件，然后再迁移一个项目是相对简单的。

<h2 style="font-weight: normal"> 1. 在当前项目目录下执行`ykit init` </h2>

```bash
$ cd MyProject
$ ykit init
```

<h2 style="font-weight: normal"> 2. 选择 ykit 配置插件 </h2>

- 如果是迁移 webpack 项目，则选择 qunar 插件，它默认支持 sass/less，实现资源带版本号，fekit_moudles 的打包，sync 命令等。
- 如果是迁移 fekit 项目，则选择 fekit 插件，里面包含了兼容旧 fekit 语法和配置的插件。

<h2 style="font-weight: normal"> 3. 根据需求修改配置文件 </h2>

在生成的配置文件 `ykit.{type}.js` 中添加资源入口、更改当前 webpack 编译配置、添加 alias 等等。

具体配置文档可参考 [Ykit-配置][1]。

<h2 style="font-weight: normal"> 4. 在项目外运行`ykit server`，并访问项目。 </h2>

[1]: ./docs-配置.html
[2]: ./docs-插件.html

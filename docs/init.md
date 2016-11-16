<h1 style="font-weight: normal"> 创建 Ykit 项目</h1>


<h2 style="font-weight: normal"> 0. 安装Ykit(注意：需要在内网环境下，且包名有`@qnpm`前缀) </h2>

```bash
$ sudo npm install @qnpm/ykit -g --registry http://registry.npm.corp.qunar.com/
```

<h2 style="font-weight: normal"> 1. 新建ykit项目 </h2>

如果是**初始化项目**，需要先创建项目目录，然后在该目录中执行`ykit init`：

```bash
$ mkdir MyYkitProject
$ cd MyYkitProject
$ ykit init
```

init 主要完成了两件事：
- 安装对应插件：根据 init 时选择的项目类型，会安装相应的 ykit 插件。它可以扩展项目的配置，帮助开发者快速搭建当前的开发环境，详见 [Ykit-插件][2]。
- 生成`ykit.{type}.js`：它是项目中的配置文件，其中的`{type}`与`ykit-config-{type}`相对应，用来在`node_modules`找到相应的插件。

<h2 style="font-weight: normal"> 2. 配置`ykit.{type}.js` </h2>

在该文件中添加资源入口、更改当前 webpack 编译配置、添加自定义命令等。

具体配置文档可参考 [Ykit-配置][1]。

<h2 style="font-weight: normal"> 3. 在项目外运行`ykit server`，并访问项目。 </h2>

[1]: ./docs-配置.html
[2]: ./docs-插件.html

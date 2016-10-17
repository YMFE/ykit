<h1 style="font-weight: normal"> 起步 </h1>

<h2 style="font-weight: normal"> 1. 新建ykit项目 </h2>

如果是**初始化项目**，需要先创建项目目录，然后在该目录中执行`ykit init`：

```bash
$ mkdir MyYkitProject
$ cd MyYkitProject
$ ykit init
```

如果是**已有项目**，直接在项目中执行`ykit init`：

```bash
$ cd MyProject
$ ykit init
```

执行该命令后，会要求选择一个项目的类型，之后会生成一个对应的配置文件`ykit.{type}.js`。如：选择类型为qunar，则会在项目中生成`ykit.qunar.js`。

<h2 style="font-weight: normal"> 2. init 结束后，我们可在`ykit.qunar.js`中进行更多的项目配置。 </h2>

- 如果是迁移fekit项目，则需要将`export & alias`等拷贝过来。
- 如果是迁移webpack项目，需要在`ykit.qunar.js`的`modifyWebpackConfig`函数中进行webpack的配置。

具体config如何配置可参考[这里][1]。

<h2 style="font-weight: normal"> 3. 在项目外运行`ykit server`，并访问项目。 </h2>

[1]: ./config.html

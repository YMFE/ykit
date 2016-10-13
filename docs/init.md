## 初始化 / 迁移项目

1.进入项目执行init命令

- 初始化项目：

```bash
$ mkdir MyYkitProject && cd MyYkitProject && ykit init
```

- 迁移项目：

```bash
$ cd MyProject && ykit init
```

执行`ykit init`后，会要求选择一个项目的类型，之后会生成一个对应的配置文件`ykit.{type}.js`。如：选择类型为qunar，则会在项目中生成`ykit.qunar.js`。

2.init结束后，我们可在`ykit.qunar.js`中进行更多的项目配置。

- 如果是迁移fekit项目，则需要将`export/alias`等拷贝过来。
- 如果是迁移webpack项目，需要在`ykit.qunar.js`的`setCompiler`函数中进行webpack的配置。

具体config如何配置可参考[这里](config)。

3.在项目外运行`ykit server`，并访问项目。

<h1 style="font-weight: normal"> 命令行工具 </h1>

Ykit 命令行工具可以通过运行 `ykit -h` 查看所有基础命令。

- init            # 项目初始化
- server          # 开发服务
- pack            # 资源编译、打包
- lint            # 代码质量检测

**注：以上命令均可以使用缩写，如 `ykit s` 等同于 `ykit server`。**

通过 `ykit {命令名} -h` 可以查看该指令的参数，如：

```
$ ykit server -h

Options:
  -p, --port         端口
  -x, --proxy        启用proxy代理服务
  -m, --middlewares  加载项目中间件
  -a, --all          整体编译
  -s, --https        使用https协议
  -h, --help         查看帮助
```

<h3 style="font-weight: normal"> init </h3>

这个命令将会配置初始化向导。用户通过选择项目类型，它就可以帮助用户快速地在当前工作目录下创建 ykit.{type}.js 文件，并安装相应插件。

<h3 style="font-weight: normal"> server </h3>

这个命令会在本地起静态服务，并对`/{project}/prd/`路径下的资源进行编译，保持与Fekit一致。

**注意: 只有`ykit.{type}.js`中设置了export的资源才会编译。**

编译静态资源有两种方式，默认是按请求编译，适合export资源较多的项目。

当加上-a--all参数后，则在第一次加载时将export资源全部编译，适合单页应用等静态资源入口较少的项目。

<h3 style="font-weight: normal"> pack </h3>

对项目进行打包。对于Qunar的项目，打包后会生成相应目录，来放置带版本号的资源。

- `ykit pack`命令，相当于之前的`fekit pack`。首先生成`dev`目录，并按目录结构生成`**/{name}@dev.{ext}`，另外会生成`**/{name}@dev.{ext}.map`用于调试。

- `ykit pack -m`命令，相当于之前的`fekit min`。首先生成`prd`和`ver`目录，并按目录结构生成`**/{name}@{version}.{ext}`，即打包压缩后的资源。同时在`ver`目录生成对应`{name}.{ext}.ver`和`versions.mapping`。

- `ykit pack -g {groupname}`命令，可指定分组打包，不影响其它已存在的打包资源。

- `ykit pack -c false`ykit 在打包之前会清空打包目标目录(dev/prd)，使用这个命令使 ykit 不预先清空。

<h3 style="font-weight: normal"> lint </h3>

这个命令会对项目进行 eslint 检查，第一次在项目中执行 ykit lint 后，会生成相应的 .eslintrc.json，可后续对它进行更改，如添加 lint 规则、忽略目录等。

进入项目目录，执行`ykit lint`即可，其它参数：

`ykit lint -d {dir}` 对指定目录或文件执行 lint 。

<h2 style="font-weight: normal"> 附加命令 </h2>

Ykit 插件会为当前项目添加附加命令。如在一个 Qunar 项目中，可以运行`ykit sync`命令等。当前项目环境下的命令列表可以使用`ykit -h`查看。

<h2 style="font-weight: normal"> 项目自定义命令 </h2>

在`ykit.{type}.js`中可以配置项目自定义命令，相当于执行一段 Node 脚本。当前项目环境下的命令列表可以使用`ykit -h`查看。

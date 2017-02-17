# 命令行

Ykit 运行环境下可以通过 `ykit -h` 查看所有命令。

```
$ ykit -h

  init   i        # 项目初始化
  server s        # 开发服务
  pack   p        # 资源编译、打包
  lint   l        # 代码质量检测
```

**注：以上命令均可以使用缩写，如 `ykit s` 等同于 `ykit server`。**

通过 `ykit {命令名} -h` 可以查看该指令的参数，如：

```
$ ykit server -h

Options:
  -p, --port        # 端口
  -x, --proxy       # 启用proxy代理服务
  -m, --middlewares # 加载项目中间件
  -s, --https       # 使用https协议
  -h, --help        # 查看帮助
```

## init

这个命令将会在当前目录初始化 Ykit 工程。

```
$ ykit init
```

另外你可以选择初始化一个特定类型的项目，Ykit 会寻找相应的插件并自动帮你完成。如创建一个 qunar 项目（需要内网）：

```
$ ykit init qunar
```

## server

这个命令会在当前目录下建立静态资源服务。

| 参数       | 说明   |  使用  |
| --------- | ------ | ----  |
| -p        | 设置服务端口 | -p 3000 |
| -s        | 开启 https 服务 | - |
| -x        | 开启代理工具 | -|

示例：

```
$ ykit server -p 3000
```

## pack

这个命令对项目内资源进行打包。

| 参数       | 说明   |  使用  |
| --------- | ------ | ----  |
| -m        | 压缩代码，并生成 prd 输出目录存放资源 | - |
| -c        | 打包前是否先清空目标路径，默认清空 | -c=false |

示例：

```
$ ykit pack -m
```

## lint

这个命令会对项目进行 ESLint 检查。

如果项目中没有 ESLint 配置文件第一次在项目中执行 lint 命令后，会生成相应的 `.eslintrc.json`，可后续对它进行更改，如添加 lint 规则、忽略目录等。

| 参数       | 说明   |  使用  |
| --------- | ------ | ----  |
| -d        | 指定特定 ESLint 检查目录 | -d ./src |

示例：

```
$ ykit lint -d ./src
```

## 其它命令

插件和项目中的自定义命令也可以在 Ykit 环境中执行，可以通过它们对命令进行扩展。参考：

- [使用手册 - 配置][1]
- [如何编写一个插件][2]

[1]: docs-配置.html
[2]: How-to-write-a-plugin.html

<a name="0.1.8-rc1"></a>
## [0.1.8-rc1](http://gitlab.corp.qunar.com/mfe/ykit/compare/v0.1.8-rc0...v0.1.8-rc1) (2016-12-07)


### Bug Fixes

* **pack:** 修复自身版本号使用 webpack-md5-hash 时问题 ([2da0378](http://gitlab.corp.qunar.com/mfe/ykit/commit/2da0378))


### Performance Improvements

* **pack:** 优化 pack log ([c814175](http://gitlab.corp.qunar.com/mfe/ykit/commit/c814175))



<a name="0.1.8-rc0"></a>
## [0.1.8-rc0](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.7...0.1.8-rc0) (2016-12-06)


### Bug Fixes

* **cli:** 修复自定义命令没有缩写会造成 help 命令报错 ([17f6d7b](http://gitlab.corp.qunar.com/mfe/ykit/commit/17f6d7b))
* **server:** 修复 rebuild 结束没有给出明显提示 ([9036cbc](http://gitlab.corp.qunar.com/mfe/ykit/commit/9036cbc))


### Features

* **init:** 修改fekit项目的config文件模板，因为fekit项目支持一键导入，所以所有的配置都可以直接从fekit.config中读取了。 ([9f94e87](http://gitlab.corp.qunar.com/mfe/ykit/commit/9f94e87))
* **pack:** 使用 uglify 进行压缩 (+1 squashed commit) ([cb151c7](http://gitlab.corp.qunar.com/mfe/ykit/commit/cb151c7))
* **pack:** 给出明确 optimize 提示 ([3e67b01](http://gitlab.corp.qunar.com/mfe/ykit/commit/3e67b01))



<a name="0.1.7"></a>
## [0.1.7](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.6...0.1.7) (2016-12-02)


### Bug Fixes

* 修复 map 文件返回错误 ([1f0f055](http://gitlab.corp.qunar.com/mfe/ykit/commit/1f0f055))
* 修复 ora 不支持 node 0.12 ([c9d7120](http://gitlab.corp.qunar.com/mfe/ykit/commit/c9d7120))
* 修复 windows 下入口路径匹配问题 ([21a372d](http://gitlab.corp.qunar.com/mfe/ykit/commit/21a372d))
* 修复找不到配置模块会重置 .ykitrc ([c1a03d5](http://gitlab.corp.qunar.com/mfe/ykit/commit/c1a03d5))
* **server:** 修复自身定义的 chunk 方式 ([40e147a](http://gitlab.corp.qunar.com/mfe/ykit/commit/40e147a))
* 修复设置 entry 有语法问题时二次报错 ([d983709](http://gitlab.corp.qunar.com/mfe/ykit/commit/d983709))
* **pack:** 修复找不到删除的 .cache 文件 ([57fd410](http://gitlab.corp.qunar.com/mfe/ykit/commit/57fd410))
* **Project:** 用户配置对象使用了export保留字作为属性，为了兼容性考虑继续支持，但另外提供正确的属性名exports作为以后的推荐配置。 ([4095833](http://gitlab.corp.qunar.com/mfe/ykit/commit/4095833))
* **server:** js文件入口不存在时，依然会等待其他资源编译结束resolve而不是直接返回404，这时候会变成一个永远pending的请求。 ([2193385](http://gitlab.corp.qunar.com/mfe/ykit/commit/2193385))
* **server:** 修复路径问题 ([ba291a6](http://gitlab.corp.qunar.com/mfe/ykit/commit/ba291a6))
* **server:** 修改权限不足错误提示 ([e8cb6a4](http://gitlab.corp.qunar.com/mfe/ykit/commit/e8cb6a4))
* **server:** 修改配置，去除 qunar 内容 ([f18aff1](http://gitlab.corp.qunar.com/mfe/ykit/commit/f18aff1))
* 修复额外资源没有去掉版本号 ([83ff4d1](http://gitlab.corp.qunar.com/mfe/ykit/commit/83ff4d1))
* 去掉 pack 二次回调 ([d3e1c1c](http://gitlab.corp.qunar.com/mfe/ykit/commit/d3e1c1c))
* 移除多余测试文件 ([4b3a960](http://gitlab.corp.qunar.com/mfe/ykit/commit/4b3a960))
* **server:** 同步 lib/server.js ([7583c94](http://gitlab.corp.qunar.com/mfe/ykit/commit/7583c94))
* **server:** 完善js文件404错误提示 ([a5b029f](http://gitlab.corp.qunar.com/mfe/ykit/commit/a5b029f))
* **server:** 完善js文件404错误提示，修改状态码为404 ([36bc9fa](http://gitlab.corp.qunar.com/mfe/ykit/commit/36bc9fa))
* **server:** 将server等待时间减少到100ms提升server响应速度 ([3a21d5e](http://gitlab.corp.qunar.com/mfe/ykit/commit/3a21d5e))
* **server:** 添加默认 chunk 配置，修改未找到资源的 404 返回 ([6dda6d1](http://gitlab.corp.qunar.com/mfe/ykit/commit/6dda6d1))
* **server.js:** 开发服务在入口找不到时一直pending的错误修复 ([5c3fbdf](http://gitlab.corp.qunar.com/mfe/ykit/commit/5c3fbdf))


### Features

* **Config:** 增加beforepack钩子 ([14f3e0d](http://gitlab.corp.qunar.com/mfe/ykit/commit/14f3e0d))
* **pack:** 允许在 packCallback 中更改 assetsInfo ([f263f05](http://gitlab.corp.qunar.com/mfe/ykit/commit/f263f05))
* **server:** time to 0.1.7 ([cc12792](http://gitlab.corp.qunar.com/mfe/ykit/commit/cc12792))
* 添加 hacky 方式获取内部 webpack ([ed44919](http://gitlab.corp.qunar.com/mfe/ykit/commit/ed44919))
* **server:** 使用 https 选项同时可以开启正常 http server ([a05480e](http://gitlab.corp.qunar.com/mfe/ykit/commit/a05480e))
* **server:** 延迟 404 的请求直到编译结束（使得编译副产物可以被请求到） ([9b7fb2c](http://gitlab.corp.qunar.com/mfe/ykit/commit/9b7fb2c))
* **server:** 采用新的 compile & watch 机制 ([09e1697](http://gitlab.corp.qunar.com/mfe/ykit/commit/09e1697))
* **server:** 采用新的 logger 风格 ([4b4fbce](http://gitlab.corp.qunar.com/mfe/ykit/commit/4b4fbce))
* 添加 harmonize 运行环境 ([f2aa43d](http://gitlab.corp.qunar.com/mfe/ykit/commit/f2aa43d))
* **server.js:** applyMiddleware API升级，现在允许用户调用多次绑定多个Middleware，它们将会按照绑定顺序依次执行。 ([eadd1c9](http://gitlab.corp.qunar.com/mfe/ykit/commit/eadd1c9))
* **server.js:** applyMiddleware API升级，现在允许用户调用多次绑定多个Middleware，它们将会按照绑定顺序依次执行。 ([afd868b](http://gitlab.corp.qunar.com/mfe/ykit/commit/afd868b))



<a name="0.1.6"></a>
## [0.1.6](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.5...0.1.6) (2016-11-18)


### Bug Fixes

* 修复打出冗余 log ([c72bb40](http://gitlab.corp.qunar.com/mfe/ykit/commit/c72bb40))
* **pack:** 去掉重复的packCallback调用 ([923dbc1](http://gitlab.corp.qunar.com/mfe/ykit/commit/923dbc1))
* **server:** 修复 entry 路径匹配不准 ([7c5a2f8](http://gitlab.corp.qunar.com/mfe/ykit/commit/7c5a2f8))
* **server:** 解决入口没找到时compile全部资源的问题 ([e26a8bc](http://gitlab.corp.qunar.com/mfe/ykit/commit/e26a8bc))
* 修复找不到从入口引用的 css ([9855caf](http://gitlab.corp.qunar.com/mfe/ykit/commit/9855caf))
* 修复没有错误提示 ([e6c4778](http://gitlab.corp.qunar.com/mfe/ykit/commit/e6c4778))


### Features

* **server:** 由显示所有本机 ip 改为只显示 127.0.0.1 ([145d4e5](http://gitlab.corp.qunar.com/mfe/ykit/commit/145d4e5))
* 去掉 stylelint 以提升安装速度 ([06363d7](http://gitlab.corp.qunar.com/mfe/ykit/commit/06363d7))
* 添加 command abbr ([1080784](http://gitlab.corp.qunar.com/mfe/ykit/commit/1080784))
* 添加 command abbr ([0a63ff7](http://gitlab.corp.qunar.com/mfe/ykit/commit/0a63ff7))
* 添加 command abbr ([cf428c9](http://gitlab.corp.qunar.com/mfe/ykit/commit/cf428c9))



<a name="0.1.5"></a>
## [0.1.5](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.4...0.1.5) (2016-11-14)


### Bug Fixes

* changelog commit id ([4473b7c](http://gitlab.corp.qunar.com/mfe/ykit/commit/4473b7c))
* resolve.alias 不能带 $ ([fb250a7](http://gitlab.corp.qunar.com/mfe/ykit/commit/fb250a7))
* 修复 alias 不生效 ([1506eb8](http://gitlab.corp.qunar.com/mfe/ykit/commit/1506eb8))
* 修复 alias 中对于 { xyz: "/some/dir" } 的适配 ([ccbffb5](http://gitlab.corp.qunar.com/mfe/ykit/commit/ccbffb5))
* 修复 css 版本号引路径而变更 ([9371d2e](http://gitlab.corp.qunar.com/mfe/ykit/commit/9371d2e))
* 修复 webpack 编译过程中无法停止进程 ([bab94b8](http://gitlab.corp.qunar.com/mfe/ykit/commit/bab94b8))
* 修复方法拼写错误 ([313b1b0](http://gitlab.corp.qunar.com/mfe/ykit/commit/313b1b0))
* 修复无法正确关闭代理 ([5ca9685](http://gitlab.corp.qunar.com/mfe/ykit/commit/5ca9685))
* 修复无法设置分组入口 ([e39eb9a](http://gitlab.corp.qunar.com/mfe/ykit/commit/e39eb9a))
* 去掉冗余 pack log ([0513269](http://gitlab.corp.qunar.com/mfe/ykit/commit/0513269))
* 添加必要依赖 ([7de4b86](http://gitlab.corp.qunar.com/mfe/ykit/commit/7de4b86))


### Features

* server 启动时i会使用 config.output.local ([73959eb](http://gitlab.corp.qunar.com/mfe/ykit/commit/73959eb))
* 使业务可以获取当前 ykit 环境 ([08dc33d](http://gitlab.corp.qunar.com/mfe/ykit/commit/08dc33d))
* 所有静态资源支持跨域 ([17d1139](http://gitlab.corp.qunar.com/mfe/ykit/commit/17d1139))



<a name="0.1.4"></a>
## [0.1.4](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.3...0.1.4) (2016-10-21)


### Bug Fixes

* **lib:** 同步cli.js与ykit.common.js ([3a7de72](http://gitlab.corp.qunar.com/mfe/ykit/commit/3a7de72))
* **pack:** 修复pack -m参数parse报错 ([a7d3fb1](http://gitlab.corp.qunar.com/mfe/ykit/commit/a7d3fb1))
* 去掉冗余文件 ([6833706](http://gitlab.corp.qunar.com/mfe/ykit/commit/6833706))
* **pack:** 修复打包错误重复输出 ([50b40ce](http://gitlab.corp.qunar.com/mfe/ykit/commit/50b40ce))
* **server:** 修复编译config返回undefined时报错 ([b9c3eb8](http://gitlab.corp.qunar.com/mfe/ykit/commit/b9c3eb8))


### Features

* **config:** 支持返回对象设置config ([b8fb717](http://gitlab.corp.qunar.com/mfe/ykit/commit/b8fb717))
* **config:** 添加设置分组入口 ([11890bf](http://gitlab.corp.qunar.com/mfe/ykit/commit/11890bf))



<a name="0.1.3"></a>
## [0.1.3](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.2...0.1.3) (2016-10-12)


### Bug Fixes

* **compile:** 修复同目录下同名不同后缀文件编译冲突 ([531d3fb](http://gitlab.corp.qunar.com/mfe/ykit/commit/531d3fb))
* **lint:** 修复找不到eslintrc问题 ([127206d](http://gitlab.corp.qunar.com/mfe/ykit/commit/127206d))
* **lint:** 修复找不到lint配置文件extends字段 ([1a33339](http://gitlab.corp.qunar.com/mfe/ykit/commit/1a33339))
* **log:** 修复在windows上log频繁问题 ([37ddf51](http://gitlab.corp.qunar.com/mfe/ykit/commit/37ddf51))
* **min:** 修复pack -m mangle参数配置问题 ([e7a53c6](http://gitlab.corp.qunar.com/mfe/ykit/commit/e7a53c6))
* **server:** 修复ext插件找不到编译路径问题 ([e37dcf6](http://gitlab.corp.qunar.com/mfe/ykit/commit/e37dcf6))
* **server:** 修复windows下重复设置header报错 ([aba0339](http://gitlab.corp.qunar.com/mfe/ykit/commit/aba0339))
* **server:** 修复windows下重复设置header报错 ([ef53bb0](http://gitlab.corp.qunar.com/mfe/ykit/commit/ef53bb0))


### Features

* **lint:** 添加qunar默认lint规则 ([f017f5f](http://gitlab.corp.qunar.com/mfe/ykit/commit/f017f5f))
* **lint:** 添加可配置lint文件类型 ([ee6b0d5](http://gitlab.corp.qunar.com/mfe/ykit/commit/ee6b0d5))
* **pack:** 添加pack静默模式 ([f5b9139](http://gitlab.corp.qunar.com/mfe/ykit/commit/f5b9139))



<a name="0.1.2"></a>
## [0.1.2](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.1...0.1.2) (2016-10-09)


### Bug Fixes

* **pack:** 修复build机器上找不到process.stderr报错 ([6424cd2](http://gitlab.corp.qunar.com/mfe/ykit/commit/6424cd2))
* **reload:** 修复not in gzip format解压报错 ([8761301](http://gitlab.corp.qunar.com/mfe/ykit/commit/8761301))



<a name="0.1.1"></a>
## [0.1.1](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.0...0.1.1) (2016-10-08)


### Bug Fixes

* **fileName:** 修复formatOutput插件命名错误 ([cebc126](http://gitlab.corp.qunar.com/mfe/ykit/commit/cebc126))
* **pack:** 修复progress插件文件命名错误 ([d48dac9](http://gitlab.corp.qunar.com/mfe/ykit/commit/d48dac9))
* **pack:** 修复警告输出报错 ([43e08b2](http://gitlab.corp.qunar.com/mfe/ykit/commit/43e08b2))
* **server:** 修复按请求编译css时入口filter未生效 ([ef45fac](http://gitlab.corp.qunar.com/mfe/ykit/commit/ef45fac))
* **server:** 修复请求资源中带query引起的重复编译 ([751c1a6](http://gitlab.corp.qunar.com/mfe/ykit/commit/751c1a6))



<a name="0.1.0"></a>
# [0.1.0](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.5...0.1.0) (2016-09-27)


### Bug Fixes

* **reload:** 修复指定服务地址不生效 ([2e23f7c](http://gitlab.corp.qunar.com/mfe/ykit/commit/2e23f7c))


### Features

* **reload:** 增加从ykit服务拉取插件功能 ([7382ef5](http://gitlab.corp.qunar.com/mfe/ykit/commit/7382ef5))



<a name="0.0.5"></a>
## [0.0.5](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.4...0.0.5) (2016-09-09)


### Bug Fixes

* **eslint:** 修复eslint无法extend, 提供lint设置接口 ([56a4983](http://gitlab.corp.qunar.com/mfe/ykit/commit/56a4983))
* **eslint:** 修复找不到全局eslint报错 ([a9c60ee](http://gitlab.corp.qunar.com/mfe/ykit/commit/a9c60ee))
* **file:** 添加之前全局忽略的Config.js ([b613863](http://gitlab.corp.qunar.com/mfe/ykit/commit/b613863))
* **lib:** 去掉多余编译文件 ([c6f8c80](http://gitlab.corp.qunar.com/mfe/ykit/commit/c6f8c80))
* **live reload:** 修复有时live reload 不生效 ([1401222](http://gitlab.corp.qunar.com/mfe/ykit/commit/1401222))
* **node 0.12:** 替换Object.assign为extend ([64deff2](http://gitlab.corp.qunar.com/mfe/ykit/commit/64deff2))
* **pack:** 修复windows下移除目录命令不生效 ([f5b6d0e](http://gitlab.corp.qunar.com/mfe/ykit/commit/f5b6d0e))
* **plugin:** 修复找不到本地ykit-config-xxx ([faa5a8b](http://gitlab.corp.qunar.com/mfe/ykit/commit/faa5a8b))
* **server:** 为watch入口添加interval，防止自动储存引发性能问题 ([ab7c1b0](http://gitlab.corp.qunar.com/mfe/ykit/commit/ab7c1b0))
* **server:** 修复extend config导致sass loader不生效 ([96962a7](http://gitlab.corp.qunar.com/mfe/ykit/commit/96962a7))
* **server:** 修复node_modules中resolve extension不生效 ([b81f867](http://gitlab.corp.qunar.com/mfe/ykit/commit/b81f867))
* **server:** 修复watch文件可能造成内存泄露问题 ([9a59d61](http://gitlab.corp.qunar.com/mfe/ykit/commit/9a59d61))
* **server:** 修复更改入口以后服务 / 打包报错 ([1880c2f](http://gitlab.corp.qunar.com/mfe/ykit/commit/1880c2f))
* **server:** 修复测试目录 ([7e229e9](http://gitlab.corp.qunar.com/mfe/ykit/commit/7e229e9))
* **source map:** 修复babel-loader在webpack中source map不生效问题 ([7f5378f](http://gitlab.corp.qunar.com/mfe/ykit/commit/7f5378f))


### Features

* **cmd:** 增加-v和-h指令 ([f645595](http://gitlab.corp.qunar.com/mfe/ykit/commit/f645595))
* **init:** 添加初始化说明，支持无默认类型 ([e6563ab](http://gitlab.corp.qunar.com/mfe/ykit/commit/e6563ab))
* **lint:** 根据lint结果返回不同值 ([05a17d9](http://gitlab.corp.qunar.com/mfe/ykit/commit/05a17d9))
* **logger:** 编译状态log加上时间 ([b8e2630](http://gitlab.corp.qunar.com/mfe/ykit/commit/b8e2630))
* **plugin:** 添加搜寻全局插件模式 ([e3554bc](http://gitlab.corp.qunar.com/mfe/ykit/commit/e3554bc))
* **server:** 支持https ([a6bac57](http://gitlab.corp.qunar.com/mfe/ykit/commit/a6bac57))
* **server:** 默认改为按请求资源打包，整体打包改为可选参数 ([92ecfa3](http://gitlab.corp.qunar.com/mfe/ykit/commit/92ecfa3))



<a name="0.0.4"></a>
## [0.0.4](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.3...0.0.4) (2016-08-26)


### Bug Fixes

* **init:** 修复重写package.json问题 ([e0462e5](http://gitlab.corp.qunar.com/mfe/ykit/commit/e0462e5))
* **server:** 修复404一直pending ([7136403](http://gitlab.corp.qunar.com/mfe/ykit/commit/7136403))
* **server:** 修复一些情况compile报错未显示 ([aa9a1e2](http://gitlab.corp.qunar.com/mfe/ykit/commit/aa9a1e2))


### Features

* **server:** 优化报错信息 ([7483355](http://gitlab.corp.qunar.com/mfe/ykit/commit/7483355))



<a name="0.0.3"></a>
## [0.0.3](http://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.2...0.0.3) (2016-08-15)


### Bug Fixes

* **config:** 修复setCompile报错 ([ef9f345](http://gitlab.corp.qunar.com/mfe/ykit/commit/ef9f345))
* **server:** 修复打包大文件时第一次渲染失败 ([b29d873](http://gitlab.corp.qunar.com/mfe/ykit/commit/b29d873))
* **server:** 修复资源过大时第一次渲染失败 ([f4e9a12](http://gitlab.corp.qunar.com/mfe/ykit/commit/f4e9a12))


### Features

* **server:** 检测到config文件变化后可以重新生成compiler ([423d485](http://gitlab.corp.qunar.com/mfe/ykit/commit/423d485))



<a name="0.0.2"></a>
## [0.0.2](http://gitlab.corp.qunar.com/mfe/ykit/compare/v0.0.1...0.0.2) (2016-08-11)


### Bug Fixes

* **config:** 修复设置loaders不生效 ([b904079](http://gitlab.corp.qunar.com/mfe/ykit/commit/b904079))
* **config:** 初始context改为src ([70be3c7](http://gitlab.corp.qunar.com/mfe/ykit/commit/70be3c7))
* **fixcss:** 修复寻找cache路径 ([d4e14ac](http://gitlab.corp.qunar.com/mfe/ykit/commit/d4e14ac))
* **fixCss:** 修复在不同context下.cache路径问题 ([f679c63](http://gitlab.corp.qunar.com/mfe/ykit/commit/f679c63))
* **fixes:** 修复css路径 ([040b519](http://gitlab.corp.qunar.com/mfe/ykit/commit/040b519))
* **init:** 优化初始化流程 ([703ef3b](http://gitlab.corp.qunar.com/mfe/ykit/commit/703ef3b))
* **init:** 去掉全局引用的shelljs ([3a8086e](http://gitlab.corp.qunar.com/mfe/ykit/commit/3a8086e))
* **init:** 改为从gitlab上安装配置 ([18ac575](http://gitlab.corp.qunar.com/mfe/ykit/commit/18ac575))
* **initTmpl:** 去掉默认用户选项 ([6c47c8d](http://gitlab.corp.qunar.com/mfe/ykit/commit/6c47c8d))
* **install:** proxy改为使用时提示安装 ([877896c](http://gitlab.corp.qunar.com/mfe/ykit/commit/877896c))
* **install proxy:** 检测权限 ([52d788a](http://gitlab.corp.qunar.com/mfe/ykit/commit/52d788a))
* **js-loader:** 优化正则 ([39c8119](http://gitlab.corp.qunar.com/mfe/ykit/commit/39c8119))
* **lint:** 优先使用项目配置的linter ([c592569](http://gitlab.corp.qunar.com/mfe/ykit/commit/c592569))
* **lint:** 优化lint提示 ([39bf20f](http://gitlab.corp.qunar.com/mfe/ykit/commit/39bf20f))
* **lint:** 修复context改变时lint路径问题 ([7030fa7](http://gitlab.corp.qunar.com/mfe/ykit/commit/7030fa7))
* **lint:** 修复jsx没有被lint ([ce1fa37](http://gitlab.corp.qunar.com/mfe/ykit/commit/ce1fa37))
* **lint:** 修复没有使用到本地lint规则 ([53498bb](http://gitlab.corp.qunar.com/mfe/ykit/commit/53498bb))
* **lint:** 修复没有使用到本地lint规则 ([13d2a3f](http://gitlab.corp.qunar.com/mfe/ykit/commit/13d2a3f))
* **logger:** 优化pack/server logger ([c003504](http://gitlab.corp.qunar.com/mfe/ykit/commit/c003504))
* **pack:** 修改默认context ([c91715d](http://gitlab.corp.qunar.com/mfe/ykit/commit/c91715d))
* **package.json:** lint和livereload不在初始默认安装，而是调用命令式提示安装 ([72466b9](http://gitlab.corp.qunar.com/mfe/ykit/commit/72466b9))
* **path:** 兼容windows path ([a8d90ff](http://gitlab.corp.qunar.com/mfe/ykit/commit/a8d90ff))
* **QProxy:** 兼容windows ([f46ccb6](http://gitlab.corp.qunar.com/mfe/ykit/commit/f46ccb6))
* **readrc:** 如果没有rc不报错，在init时reload ([ffbd178](http://gitlab.corp.qunar.com/mfe/ykit/commit/ffbd178))
* **server:** 优化server启动报错提示 ([e36c697](http://gitlab.corp.qunar.com/mfe/ykit/commit/e36c697))
* **setConfig:** 修复返回undefined时报错 ([cdc1ad3](http://gitlab.corp.qunar.com/mfe/ykit/commit/cdc1ad3))
* **setConfig:** 支持设置context相对路径 ([6afd43d](http://gitlab.corp.qunar.com/mfe/ykit/commit/6afd43d))


### Features

* **alias:** 兼容fekit形式alias ([c9ff1b9](http://gitlab.corp.qunar.com/mfe/ykit/commit/c9ff1b9))
* **cmd:** 添加init ([768a387](http://gitlab.corp.qunar.com/mfe/ykit/commit/768a387))
* **compile:** 自动添加context为resolve.root ([8c6302c](http://gitlab.corp.qunar.com/mfe/ykit/commit/8c6302c))
* **env:** 支持node 0.12 ([4380c73](http://gitlab.corp.qunar.com/mfe/ykit/commit/4380c73))
* **gulp:** 第一次启动时也编译 ([385748d](http://gitlab.corp.qunar.com/mfe/ykit/commit/385748d))
* **init:** 添加xta/none init选项 ([e4330fc](http://gitlab.corp.qunar.com/mfe/ykit/commit/e4330fc))
* **lint:** lint可以指定目录/文件 ([9d21d95](http://gitlab.corp.qunar.com/mfe/ykit/commit/9d21d95))
* **pack:** 可配置打包前是否清空输出目录 ([eac936a](http://gitlab.corp.qunar.com/mfe/ykit/commit/eac936a))
* **package.json:** 添加jerryproxy作为初始组件 ([0e086ef](http://gitlab.corp.qunar.com/mfe/ykit/commit/0e086ef))
* **server:** 添加代理功能 ([3189f29](http://gitlab.corp.qunar.com/mfe/ykit/commit/3189f29))
* **server/pack:** 支持入口为数组 ([bbb5808](http://gitlab.corp.qunar.com/mfe/ykit/commit/bbb5808))
* **setConfig:** 添加对alias处理 ([e2b41ce](http://gitlab.corp.qunar.com/mfe/ykit/commit/e2b41ce))



<a name="0.0.1"></a>
## [0.0.1](http://gitlab.corp.qunar.com/mfe/ykit/compare/4615fd0...v0.0.1) (2016-07-15)


### Bug Fixes

* **lint:** remove log ([353ac74](http://gitlab.corp.qunar.com/mfe/ykit/commit/353ac74))
* **pack:** min err ([f016a5f](http://gitlab.corp.qunar.com/mfe/ykit/commit/f016a5f))
* **Project:** 修复找不到this.options ([ea22ae6](http://gitlab.corp.qunar.com/mfe/ykit/commit/ea22ae6))
* **reload:** 修复找不到manager ([3da7549](http://gitlab.corp.qunar.com/mfe/ykit/commit/3da7549))
* **server:** logger url改用相对路径（考虑一些工程相对路径已经很长了...所以不用绝对路径） ([d2e6dc5](http://gitlab.corp.qunar.com/mfe/ykit/commit/d2e6dc5))
* **server log:** 修复文件大小单位格式 ([c1055ec](http://gitlab.corp.qunar.com/mfe/ykit/commit/c1055ec))
* **server logger:** 更改打包文件显示单位 ([11f7094](http://gitlab.corp.qunar.com/mfe/ykit/commit/11f7094))
* **setConfig:** 修复setConfig中上下文环境不对 ([2c12155](http://gitlab.corp.qunar.com/mfe/ykit/commit/2c12155))


### Features

* **ext plguin:** 支持js后缀转换 ([f4578c8](http://gitlab.corp.qunar.com/mfe/ykit/commit/f4578c8))
* **global:** 添加全局log方法 ([8cb0c61](http://gitlab.corp.qunar.com/mfe/ykit/commit/8cb0c61))
* **lint:** add lint command and example ([73bb6be](http://gitlab.corp.qunar.com/mfe/ykit/commit/73bb6be))
* **pack:** add -m/--min option ([50cc200](http://gitlab.corp.qunar.com/mfe/ykit/commit/50cc200))
* **pack:** add css-loader ([09d2391](http://gitlab.corp.qunar.com/mfe/ykit/commit/09d2391))
* **pack:** add CssEntryLoaderPlugin ([7a3eecf](http://gitlab.corp.qunar.com/mfe/ykit/commit/7a3eecf))
* **pack:** add es6 compiler ([51d5dda](http://gitlab.corp.qunar.com/mfe/ykit/commit/51d5dda))
* **pack:** add pack command demo & test ([4615fd0](http://gitlab.corp.qunar.com/mfe/ykit/commit/4615fd0))
* **pack:** add source map opt ([3a655f2](http://gitlab.corp.qunar.com/mfe/ykit/commit/3a655f2))
* **pack:** 显示错误详细信息 ([4f592be](http://gitlab.corp.qunar.com/mfe/ykit/commit/4f592be))
* **pack:** 添加打包进度条 ([9e93625](http://gitlab.corp.qunar.com/mfe/ykit/commit/9e93625))
* **pack:** 添加设置分组参数 ([551c0b4](http://gitlab.corp.qunar.com/mfe/ykit/commit/551c0b4))
* **pack logger:** 添加打包log ([141fb55](http://gitlab.corp.qunar.com/mfe/ykit/commit/141fb55))
* **server:** add live reload ([e77692b](http://gitlab.corp.qunar.com/mfe/ykit/commit/e77692b))
* **server:** add logger ([dc8ad5f](http://gitlab.corp.qunar.com/mfe/ykit/commit/dc8ad5f))
* **server:** add server command ([e93c20f](http://gitlab.corp.qunar.com/mfe/ykit/commit/e93c20f))
* **server:** add source map ([c09678f](http://gitlab.corp.qunar.com/mfe/ykit/commit/c09678f))
* **server:** 优化error/warning log信息 ([c70b54c](http://gitlab.corp.qunar.com/mfe/ykit/commit/c70b54c))




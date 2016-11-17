<a name="0.1.6-rc3"></a>
## [0.1.6-rc3](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.6-rc2...v0.1.6-rc3) (2016-11-17)


### Bug Fixes

* 修复打出冗余 log ([c72bb40](https://gitlab.corp.qunar.com/mfe/ykit/commit/c72bb40))
* **server:** 修复 entry 路径匹配不准 ([7c5a2f8](https://gitlab.corp.qunar.com/mfe/ykit/commit/7c5a2f8))



<a name="0.1.6-rc2"></a>
## [0.1.6-rc2](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.6-rc1...0.1.6-rc2) (2016-11-17)


### Bug Fixes

* **server:** 解决入口没找到时compile全部资源的问题 ([e26a8bc](https://gitlab.corp.qunar.com/mfe/ykit/commit/e26a8bc))



<a name="0.1.6-rc1"></a>
## [0.1.6-rc1](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.6-rc0...0.1.6-rc1) (2016-11-16)


### Features

* 去掉 stylelint 以提升安装速度 ([06363d7](https://gitlab.corp.qunar.com/mfe/ykit/commit/06363d7))



<a name="0.1.6-rc0"></a>
## [0.1.6-rc0](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.5...0.1.6-rc0) (2016-11-16)


### Features

* **server:** 由显示所有本机 ip 改为只显示 127.0.0.1 ([145d4e5](https://gitlab.corp.qunar.com/mfe/ykit/commit/145d4e5))



<a name="0.1.5"></a>
## [0.1.5](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.5-rc6...0.1.5) (2016-11-14)



<a name="0.1.5-rc6"></a>
## [0.1.5-rc6](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.4...0.1.5-rc6) (2016-11-14)


### Bug Fixes

* changelog commit id ([4473b7c](https://gitlab.corp.qunar.com/mfe/ykit/commit/4473b7c))
* resolve.alias 不能带 $ ([fb250a7](https://gitlab.corp.qunar.com/mfe/ykit/commit/fb250a7))
* 修复 alias 不生效 ([1506eb8](https://gitlab.corp.qunar.com/mfe/ykit/commit/1506eb8))
* 修复 alias 中对于 { xyz: "/some/dir" } 的适配 ([ccbffb5](https://gitlab.corp.qunar.com/mfe/ykit/commit/ccbffb5))
* 修复 css 版本号引路径而变更 ([9371d2e](https://gitlab.corp.qunar.com/mfe/ykit/commit/9371d2e))
* 修复 webpack 编译过程中无法停止进程 ([bab94b8](https://gitlab.corp.qunar.com/mfe/ykit/commit/bab94b8))
* 修复方法拼写错误 ([313b1b0](https://gitlab.corp.qunar.com/mfe/ykit/commit/313b1b0))
* 修复无法正确关闭代理 ([5ca9685](https://gitlab.corp.qunar.com/mfe/ykit/commit/5ca9685))
* 修复无法设置分组入口 ([e39eb9a](https://gitlab.corp.qunar.com/mfe/ykit/commit/e39eb9a))
* 去掉冗余 pack log ([0513269](https://gitlab.corp.qunar.com/mfe/ykit/commit/0513269))
* 添加必要依赖 ([7de4b86](https://gitlab.corp.qunar.com/mfe/ykit/commit/7de4b86))


### Features

* server 启动时i会使用 config.output.local ([73959eb](https://gitlab.corp.qunar.com/mfe/ykit/commit/73959eb))
* 使业务可以获取当前 ykit 环境 ([08dc33d](https://gitlab.corp.qunar.com/mfe/ykit/commit/08dc33d))
* 所有静态资源支持跨域 ([17d1139](https://gitlab.corp.qunar.com/mfe/ykit/commit/17d1139))



<a name="0.1.4"></a>
## [0.1.4](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.3...0.1.4) (2016-10-21)


### Bug Fixes

* **lib:** 同步cli.js与ykit.common.js ([3a7de72](https://gitlab.corp.qunar.com/mfe/ykit/commit/3a7de72))
* **pack:** 修复pack -m参数parse报错 ([a7d3fb1](https://gitlab.corp.qunar.com/mfe/ykit/commit/a7d3fb1))
* 去掉冗余文件 ([6833706](https://gitlab.corp.qunar.com/mfe/ykit/commit/6833706))
* **pack:** 修复打包错误重复输出 ([50b40ce](https://gitlab.corp.qunar.com/mfe/ykit/commit/50b40ce))
* **server:** 修复编译config返回undefined时报错 ([b9c3eb8](https://gitlab.corp.qunar.com/mfe/ykit/commit/b9c3eb8))


### Features

* **config:** 支持返回对象设置config ([b8fb717](https://gitlab.corp.qunar.com/mfe/ykit/commit/b8fb717))
* **config:** 添加设置分组入口 ([11890bf](https://gitlab.corp.qunar.com/mfe/ykit/commit/11890bf))



<a name="0.1.3"></a>
## [0.1.3](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.2...0.1.3) (2016-10-12)


### Bug Fixes

* **compile:** 修复同目录下同名不同后缀文件编译冲突 ([531d3fb](https://gitlab.corp.qunar.com/mfe/ykit/commit/531d3fb))
* **lint:** 修复找不到eslintrc问题 ([127206d](https://gitlab.corp.qunar.com/mfe/ykit/commit/127206d))
* **lint:** 修复找不到lint配置文件extends字段 ([1a33339](https://gitlab.corp.qunar.com/mfe/ykit/commit/1a33339))
* **log:** 修复在windows上log频繁问题 ([37ddf51](https://gitlab.corp.qunar.com/mfe/ykit/commit/37ddf51))
* **min:** 修复pack -m mangle参数配置问题 ([e7a53c6](https://gitlab.corp.qunar.com/mfe/ykit/commit/e7a53c6))
* **server:** 修复ext插件找不到编译路径问题 ([e37dcf6](https://gitlab.corp.qunar.com/mfe/ykit/commit/e37dcf6))
* **server:** 修复windows下重复设置header报错 ([aba0339](https://gitlab.corp.qunar.com/mfe/ykit/commit/aba0339))
* **server:** 修复windows下重复设置header报错 ([ef53bb0](https://gitlab.corp.qunar.com/mfe/ykit/commit/ef53bb0))


### Features

* **lint:** 添加qunar默认lint规则 ([f017f5f](https://gitlab.corp.qunar.com/mfe/ykit/commit/f017f5f))
* **lint:** 添加可配置lint文件类型 ([ee6b0d5](https://gitlab.corp.qunar.com/mfe/ykit/commit/ee6b0d5))
* **pack:** 添加pack静默模式 ([f5b9139](https://gitlab.corp.qunar.com/mfe/ykit/commit/f5b9139))



<a name="0.1.2"></a>
## [0.1.2](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.1...0.1.2) (2016-10-09)


### Bug Fixes

* **pack:** 修复build机器上找不到process.stderr报错 ([6424cd2](https://gitlab.corp.qunar.com/mfe/ykit/commit/6424cd2))
* **reload:** 修复not in gzip format解压报错 ([8761301](https://gitlab.corp.qunar.com/mfe/ykit/commit/8761301))



<a name="0.1.1"></a>
## [0.1.1](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.1.0...0.1.1) (2016-10-08)


### Bug Fixes

* **fileName:** 修复formatOutput插件命名错误 ([cebc126](https://gitlab.corp.qunar.com/mfe/ykit/commit/cebc126))
* **pack:** 修复progress插件文件命名错误 ([d48dac9](https://gitlab.corp.qunar.com/mfe/ykit/commit/d48dac9))
* **pack:** 修复警告输出报错 ([43e08b2](https://gitlab.corp.qunar.com/mfe/ykit/commit/43e08b2))
* **server:** 修复按请求编译css时入口filter未生效 ([ef45fac](https://gitlab.corp.qunar.com/mfe/ykit/commit/ef45fac))
* **server:** 修复请求资源中带query引起的重复编译 ([751c1a6](https://gitlab.corp.qunar.com/mfe/ykit/commit/751c1a6))



<a name="0.1.0"></a>
# [0.1.0](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.5...0.1.0) (2016-09-27)


### Bug Fixes

* **reload:** 修复指定服务地址不生效 ([2e23f7c](https://gitlab.corp.qunar.com/mfe/ykit/commit/2e23f7c))


### Features

* **reload:** 增加从ykit服务拉取插件功能 ([7382ef5](https://gitlab.corp.qunar.com/mfe/ykit/commit/7382ef5))



<a name="0.0.5"></a>
## [0.0.5](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.4...0.0.5) (2016-09-09)


### Bug Fixes

* **eslint:** 修复eslint无法extend, 提供lint设置接口 ([56a4983](https://gitlab.corp.qunar.com/mfe/ykit/commit/56a4983))
* **eslint:** 修复找不到全局eslint报错 ([a9c60ee](https://gitlab.corp.qunar.com/mfe/ykit/commit/a9c60ee))
* **file:** 添加之前全局忽略的Config.js ([b613863](https://gitlab.corp.qunar.com/mfe/ykit/commit/b613863))
* **lib:** 去掉多余编译文件 ([c6f8c80](https://gitlab.corp.qunar.com/mfe/ykit/commit/c6f8c80))
* **live reload:** 修复有时live reload 不生效 ([1401222](https://gitlab.corp.qunar.com/mfe/ykit/commit/1401222))
* **node 0.12:** 替换Object.assign为extend ([64deff2](https://gitlab.corp.qunar.com/mfe/ykit/commit/64deff2))
* **pack:** 修复windows下移除目录命令不生效 ([f5b6d0e](https://gitlab.corp.qunar.com/mfe/ykit/commit/f5b6d0e))
* **plugin:** 修复找不到本地ykit-config-xxx ([faa5a8b](https://gitlab.corp.qunar.com/mfe/ykit/commit/faa5a8b))
* **server:** 为watch入口添加interval，防止自动储存引发性能问题 ([ab7c1b0](https://gitlab.corp.qunar.com/mfe/ykit/commit/ab7c1b0))
* **server:** 修复extend config导致sass loader不生效 ([96962a7](https://gitlab.corp.qunar.com/mfe/ykit/commit/96962a7))
* **server:** 修复node_modules中resolve extension不生效 ([b81f867](https://gitlab.corp.qunar.com/mfe/ykit/commit/b81f867))
* **server:** 修复watch文件可能造成内存泄露问题 ([9a59d61](https://gitlab.corp.qunar.com/mfe/ykit/commit/9a59d61))
* **server:** 修复更改入口以后服务 / 打包报错 ([1880c2f](https://gitlab.corp.qunar.com/mfe/ykit/commit/1880c2f))
* **server:** 修复测试目录 ([7e229e9](https://gitlab.corp.qunar.com/mfe/ykit/commit/7e229e9))
* **source map:** 修复babel-loader在webpack中source map不生效问题 ([7f5378f](https://gitlab.corp.qunar.com/mfe/ykit/commit/7f5378f))


### Features

* **cmd:** 增加-v和-h指令 ([f645595](https://gitlab.corp.qunar.com/mfe/ykit/commit/f645595))
* **init:** 添加初始化说明，支持无默认类型 ([e6563ab](https://gitlab.corp.qunar.com/mfe/ykit/commit/e6563ab))
* **lint:** 根据lint结果返回不同值 ([05a17d9](https://gitlab.corp.qunar.com/mfe/ykit/commit/05a17d9))
* **logger:** 编译状态log加上时间 ([b8e2630](https://gitlab.corp.qunar.com/mfe/ykit/commit/b8e2630))
* **plugin:** 添加搜寻全局插件模式 ([e3554bc](https://gitlab.corp.qunar.com/mfe/ykit/commit/e3554bc))
* **server:** 支持https ([a6bac57](https://gitlab.corp.qunar.com/mfe/ykit/commit/a6bac57))
* **server:** 默认改为按请求资源打包，整体打包改为可选参数 ([92ecfa3](https://gitlab.corp.qunar.com/mfe/ykit/commit/92ecfa3))



<a name="0.0.4"></a>
## [0.0.4](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.3...0.0.4) (2016-08-26)


### Bug Fixes

* **init:** 修复重写package.json问题 ([e0462e5](https://gitlab.corp.qunar.com/mfe/ykit/commit/e0462e5))
* **server:** 修复404一直pending ([7136403](https://gitlab.corp.qunar.com/mfe/ykit/commit/7136403))
* **server:** 修复一些情况compile报错未显示 ([aa9a1e2](https://gitlab.corp.qunar.com/mfe/ykit/commit/aa9a1e2))


### Features

* **server:** 优化报错信息 ([7483355](https://gitlab.corp.qunar.com/mfe/ykit/commit/7483355))



<a name="0.0.3"></a>
## [0.0.3](https://gitlab.corp.qunar.com/mfe/ykit/compare/0.0.2...0.0.3) (2016-08-15)


### Bug Fixes

* **config:** 修复setCompile报错 ([ef9f345](https://gitlab.corp.qunar.com/mfe/ykit/commit/ef9f345))
* **config:** 修复设置loaders不生效 ([b904079](https://gitlab.corp.qunar.com/mfe/ykit/commit/b904079))
* **config:** 初始context改为src ([70be3c7](https://gitlab.corp.qunar.com/mfe/ykit/commit/70be3c7))
* **fixcss:** 修复寻找cache路径 ([d4e14ac](https://gitlab.corp.qunar.com/mfe/ykit/commit/d4e14ac))
* **fixCss:** 修复在不同context下.cache路径问题 ([f679c63](https://gitlab.corp.qunar.com/mfe/ykit/commit/f679c63))
* **fixes:** 修复css路径 ([040b519](https://gitlab.corp.qunar.com/mfe/ykit/commit/040b519))
* **init:** 优化初始化流程 ([703ef3b](https://gitlab.corp.qunar.com/mfe/ykit/commit/703ef3b))
* **init:** 去掉全局引用的shelljs ([3a8086e](https://gitlab.corp.qunar.com/mfe/ykit/commit/3a8086e))
* **init:** 改为从gitlab上安装配置 ([18ac575](https://gitlab.corp.qunar.com/mfe/ykit/commit/18ac575))
* **initTmpl:** 去掉默认用户选项 ([6c47c8d](https://gitlab.corp.qunar.com/mfe/ykit/commit/6c47c8d))
* **install:** proxy改为使用时提示安装 ([877896c](https://gitlab.corp.qunar.com/mfe/ykit/commit/877896c))
* **install proxy:** 检测权限 ([52d788a](https://gitlab.corp.qunar.com/mfe/ykit/commit/52d788a))
* **js-loader:** 优化正则 ([39c8119](https://gitlab.corp.qunar.com/mfe/ykit/commit/39c8119))
* **lint:** 优先使用项目配置的linter ([c592569](https://gitlab.corp.qunar.com/mfe/ykit/commit/c592569))
* **lint:** 优化lint提示 ([39bf20f](https://gitlab.corp.qunar.com/mfe/ykit/commit/39bf20f))
* **lint:** 修复context改变时lint路径问题 ([7030fa7](https://gitlab.corp.qunar.com/mfe/ykit/commit/7030fa7))
* **lint:** 修复jsx没有被lint ([ce1fa37](https://gitlab.corp.qunar.com/mfe/ykit/commit/ce1fa37))
* **lint:** 修复没有使用到本地lint规则 ([53498bb](https://gitlab.corp.qunar.com/mfe/ykit/commit/53498bb))
* **lint:** 修复没有使用到本地lint规则 ([13d2a3f](https://gitlab.corp.qunar.com/mfe/ykit/commit/13d2a3f))
* **logger:** 优化pack/server logger ([c003504](https://gitlab.corp.qunar.com/mfe/ykit/commit/c003504))
* **pack:** 修改默认context ([c91715d](https://gitlab.corp.qunar.com/mfe/ykit/commit/c91715d))
* **package.json:** lint和livereload不在初始默认安装，而是调用命令式提示安装 ([72466b9](https://gitlab.corp.qunar.com/mfe/ykit/commit/72466b9))
* **path:** 兼容windows path ([a8d90ff](https://gitlab.corp.qunar.com/mfe/ykit/commit/a8d90ff))
* **QProxy:** 兼容windows ([f46ccb6](https://gitlab.corp.qunar.com/mfe/ykit/commit/f46ccb6))
* **readrc:** 如果没有rc不报错，在init时reload ([ffbd178](https://gitlab.corp.qunar.com/mfe/ykit/commit/ffbd178))
* **server:** 优化server启动报错提示 ([e36c697](https://gitlab.corp.qunar.com/mfe/ykit/commit/e36c697))
* **server:** 修复打包大文件时第一次渲染失败 ([b29d873](https://gitlab.corp.qunar.com/mfe/ykit/commit/b29d873))
* **server:** 修复资源过大时第一次渲染失败 ([f4e9a12](https://gitlab.corp.qunar.com/mfe/ykit/commit/f4e9a12))
* **setConfig:** 修复返回undefined时报错 ([cdc1ad3](https://gitlab.corp.qunar.com/mfe/ykit/commit/cdc1ad3))
* **setConfig:** 支持设置context相对路径 ([6afd43d](https://gitlab.corp.qunar.com/mfe/ykit/commit/6afd43d))


### Features

* **alias:** 兼容fekit形式alias ([c9ff1b9](https://gitlab.corp.qunar.com/mfe/ykit/commit/c9ff1b9))
* **cmd:** 添加init ([768a387](https://gitlab.corp.qunar.com/mfe/ykit/commit/768a387))
* **compile:** 自动添加context为resolve.root ([8c6302c](https://gitlab.corp.qunar.com/mfe/ykit/commit/8c6302c))
* **env:** 支持node 0.12 ([4380c73](https://gitlab.corp.qunar.com/mfe/ykit/commit/4380c73))
* **gulp:** 第一次启动时也编译 ([385748d](https://gitlab.corp.qunar.com/mfe/ykit/commit/385748d))
* **init:** 添加xta/none init选项 ([e4330fc](https://gitlab.corp.qunar.com/mfe/ykit/commit/e4330fc))
* **lint:** lint可以指定目录/文件 ([9d21d95](https://gitlab.corp.qunar.com/mfe/ykit/commit/9d21d95))
* **pack:** 可配置打包前是否清空输出目录 ([eac936a](https://gitlab.corp.qunar.com/mfe/ykit/commit/eac936a))
* **package.json:** 添加jerryproxy作为初始组件 ([0e086ef](https://gitlab.corp.qunar.com/mfe/ykit/commit/0e086ef))
* **server:** 检测到config文件变化后可以重新生成compiler ([423d485](https://gitlab.corp.qunar.com/mfe/ykit/commit/423d485))
* **server:** 添加代理功能 ([3189f29](https://gitlab.corp.qunar.com/mfe/ykit/commit/3189f29))
* **server/pack:** 支持入口为数组 ([bbb5808](https://gitlab.corp.qunar.com/mfe/ykit/commit/bbb5808))
* **setConfig:** 添加对alias处理 ([e2b41ce](https://gitlab.corp.qunar.com/mfe/ykit/commit/e2b41ce))



<a name="0.0.1"></a>
## [0.0.1](https://gitlab.corp.qunar.com/mfe/ykit/compare/4615fd0...v0.0.1) (2016-07-15)


### Bug Fixes

* **lint:** remove log ([353ac74](https://gitlab.corp.qunar.com/mfe/ykit/commit/353ac74))
* **pack:** min err ([f016a5f](https://gitlab.corp.qunar.com/mfe/ykit/commit/f016a5f))
* **Project:** 修复找不到this.options ([ea22ae6](https://gitlab.corp.qunar.com/mfe/ykit/commit/ea22ae6))
* **reload:** 修复找不到manager ([3da7549](https://gitlab.corp.qunar.com/mfe/ykit/commit/3da7549))
* **server:** logger url改用相对路径（考虑一些工程相对路径已经很长了...所以不用绝对路径） ([d2e6dc5](https://gitlab.corp.qunar.com/mfe/ykit/commit/d2e6dc5))
* **server log:** 修复文件大小单位格式 ([c1055ec](https://gitlab.corp.qunar.com/mfe/ykit/commit/c1055ec))
* **server logger:** 更改打包文件显示单位 ([11f7094](https://gitlab.corp.qunar.com/mfe/ykit/commit/11f7094))
* **setConfig:** 修复setConfig中上下文环境不对 ([2c12155](https://gitlab.corp.qunar.com/mfe/ykit/commit/2c12155))


### Features

* **ext plguin:** 支持js后缀转换 ([f4578c8](https://gitlab.corp.qunar.com/mfe/ykit/commit/f4578c8))
* **global:** 添加全局log方法 ([8cb0c61](https://gitlab.corp.qunar.com/mfe/ykit/commit/8cb0c61))
* **lint:** add lint command and example ([73bb6be](https://gitlab.corp.qunar.com/mfe/ykit/commit/73bb6be))
* **pack:** add -m/--min option ([50cc200](https://gitlab.corp.qunar.com/mfe/ykit/commit/50cc200))
* **pack:** add css-loader ([09d2391](https://gitlab.corp.qunar.com/mfe/ykit/commit/09d2391))
* **pack:** add CssEntryLoaderPlugin ([7a3eecf](https://gitlab.corp.qunar.com/mfe/ykit/commit/7a3eecf))
* **pack:** add es6 compiler ([51d5dda](https://gitlab.corp.qunar.com/mfe/ykit/commit/51d5dda))
* **pack:** add pack command demo & test ([4615fd0](https://gitlab.corp.qunar.com/mfe/ykit/commit/4615fd0))
* **pack:** add source map opt ([3a655f2](https://gitlab.corp.qunar.com/mfe/ykit/commit/3a655f2))
* **pack:** 显示错误详细信息 ([4f592be](https://gitlab.corp.qunar.com/mfe/ykit/commit/4f592be))
* **pack:** 添加打包进度条 ([9e93625](https://gitlab.corp.qunar.com/mfe/ykit/commit/9e93625))
* **pack:** 添加设置分组参数 ([551c0b4](https://gitlab.corp.qunar.com/mfe/ykit/commit/551c0b4))
* **pack logger:** 添加打包log ([141fb55](https://gitlab.corp.qunar.com/mfe/ykit/commit/141fb55))
* **server:** add live reload ([e77692b](https://gitlab.corp.qunar.com/mfe/ykit/commit/e77692b))
* **server:** add logger ([dc8ad5f](https://gitlab.corp.qunar.com/mfe/ykit/commit/dc8ad5f))
* **server:** add server command ([e93c20f](https://gitlab.corp.qunar.com/mfe/ykit/commit/e93c20f))
* **server:** add source map ([c09678f](https://gitlab.corp.qunar.com/mfe/ykit/commit/c09678f))
* **server:** 优化error/warning log信息 ([c70b54c](https://gitlab.corp.qunar.com/mfe/ykit/commit/c70b54c))




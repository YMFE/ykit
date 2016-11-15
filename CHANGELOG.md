v0.1.5 - 2016.11.14
Feat: server 启动时i会使用 config.output.local
Feat: 启动 server 的时候打印出 server address
Feat: 使业务可以获取当前 ykit 环境
Feat: 所有静态资源支持跨域
Revise: 优化 server log 格式
Fix: 修改 chunk 和 CommonsChunkPlugin 引入时产生的 bug
Fix: 修复 webpack 编译过程中无法停止进程
Fix: 修复 css 版本号引路径而变更
Fix: 修复无法正确关闭代理
Fix: 修复resolve.alias 不能带 $
Fix: 修复 alias 中对于 { xyz: "/some/dir" } 的适配
Fix: 修复无法设置分组入口
Fix: 修复 alias 不生效
Fix: 修复打包错误重复输出
Fix: 去掉冗余 pack log
docs: 更新ydoc@2.0.0版文档

v0.1.4 - 2016.10.21
* b8fb717 Feat: 支持返回对象设置config
* c67513e Refactor: 优化代码格式，引入代码检查
* 319ce7b Refactor: 完善 utils，引入测试
* 656c74e Revise: 修改ykit默认配置文件模板
* 65d126c Docs: 初始化 ykit 文档
* 2089c67 Fix: 修复读取 eslintrc 出错的问题
* b9c3eb8 Fix: 修复编译config返回undefined时报错
* 50b40ce Fix: 修复打包错误重复输出

v0.1.3 - 2016.10.12
* f5b9139 Feat: 添加 pack 静默模式
* f017f5f Feat: 添加 qunar 默认 linst 规则
* 06ec7b3 Revise: 去掉 server livereload
* 37ddf51 Fix: 修复在 windows 上 log 冗余问题
* aba0339 Fix: 修复 windows 下重复设置header报错
* 531d3fb Fix: 修复同目录下同名不同后缀文件编译冲突
* e37dcf6 Fix: 修复 ext 插件找不到编译路径问题
* 127206d Fix: 修复找不到 eslintrc 问题
* 1a33339 Fix: 修复找不到 lint 配置文件 extends 字段
* e7a53c6 Fix: 修复 pack -m mangle 参数配置问题

v0.1.2 - 2016.10.9
* ad09ebd Revise: reload命令兼容版本号格式为^0.1.0的ykit-config包
* 6424cd2 Fix: 修复build机器上找不到process.stderr报错
* 8761301 Fix: 修复not in gzip format解压报错

v0.1.1 - 2016.10.8
* 1c550d4 Revise: 全部打包时检测entry与上一次是否发生变化
* ef45fac Fix: 修复按请求编译css时入口filter未生效
* 751c1a6 Fix: 修复请求资源中带query引起的重复编译
* 43e08b2 Fix: 修复警告输出报错
* d48dac9 cebc126 Fix: 修复插件文件命名错误

v0.1.0 - 2016.9.27
* 2e23f7c Fix: 修复指定服务地址不生效

v0.0.6 - 2016.9.23
* 7382ef5 8d5b6b4 Feat: 增加从ykit服务拉取插件功能

v0.0.5 - 2016.9.9

* e3554bc Feat: ykit-config-{type}插件支持查找全局模式
* 92ecfa3 Feat: 默认改为按请求资源打包，整体打包改为可选参数
* a6bac57 Feat: server支持https
* e6563ab Feat: 添加初始化说明，支持无默认类型
* 2c12dd7 Revise: devtool默认使用source map
* d02b242 Revise: minify模式不使用source map
* 05a17d9 Revise: 根据lint结果区分返回值
* 97aca37 Revise: 更改.cache目录为.ykit_cache
* f5b6d0e Fix: 修复windows下pack移除目录命令不生效
* 1401222 Fix: 修复一些情况下启动server livereload不生效
* b81f867 Fix: 修复node_modules中resolve extension不生效
* 56a4983 Fix: 修复eslint设置extend不生效
* 9a59d61 ab7c1b0 Fix: 修复watch入口文件造成的内存泄露问题
* 1880c2f 14330fe Fix: 修复更改入口以后服务 / 打包报错

v0.0.4 - 2016.8.26

* 1ca6010 aa9a1e2 7483355 Feat: 优化编译报错 log
* d1c8e9e Revise: json-loader exclude node_modules
* 744f7f4 Revise: config api setCompile 改为 setCompiler
* fa170a3 Revise: 初始化时使用内网环境
* 7136403 Fix: 修复404请求一直 pending
* e0462e5 Fix: 修复 init 命令重写 package.json 问题

v0.0.3 - 2016.8.15

* 423d485 Feat: 检测到config文件变化后可以重新生成compiler
* 0e086ef Feat: 添加 jerryproxy 作为初始组件
* c9ff1b9 Feat: 兼容 fekit 形式 alias
* 8c6302c Feat: 默认添加 context 为 resolve.root
* f4e9a12 Fix: 修复资源过大时第一次渲染失败
* b904079 Fix: 修复 setConfig 中覆盖 loaders 未生效
* 53498bb Fix: 修复没有使用到本地 lint 规则

v0.0.2 - 2016.7.30

* 4380c73 Feat: 兼容 node 0.12.*
* 6afd43d Feat: 支持设置 context 相对路径
* bbb5808 Feat: 支持入口每一项为数组
* 3189f29 Feat: 添加 JerryProxy
* a8d90ff Fix: 修复 Windows 路径格式问题
* f679c63 Fix: 修复在不同 context 下 .cache 路径问题

v0.0.1 - 2016.7.15

* dc8ad5f Feat: 完成 server / pack logger
* e77692b Feat: 完成 server livereload
* edca9f8 Feat: 完成 stylelint
* 68e7fcb Feat: 支持 gulp & grunt
* 551c0b4 Feat: 支持分组打包
* a5013b3 Docs: 添加初始使用文档

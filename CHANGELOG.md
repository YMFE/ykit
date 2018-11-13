<a name="0.8.5"></a>
## [0.8.5](https://github.com/YMFE/ykit/compare/v0.8.5-beta.4...v0.8.5) (2018-11-13)


### Features

* modify changelog ([e79c7e3](https://github.com/YMFE/ykit/commit/e79c7e3))
* 增加注释 ([b86d7b3](https://github.com/YMFE/ykit/commit/b86d7b3))



<a name="0.8.5-beta.4"></a>
## [0.8.5-beta.4](https://github.com/YMFE/ykit/compare/v0.8.5-beta.3...v0.8.5-beta.4) (2018-11-12)



<a name="0.8.5-beta.3"></a>
## [0.8.5-beta.3](https://github.com/YMFE/ykit/compare/v0.8.5-beta.2...v0.8.5-beta.3) (2018-11-12)



<a name="0.8.5-beta.2"></a>
## [0.8.5-beta.2](https://github.com/YMFE/ykit/compare/v0.8.5-beta.1...v0.8.5-beta.2) (2018-11-12)



<a name="0.8.5-beta.1"></a>
## [0.8.5-beta.1](https://github.com/YMFE/ykit/compare/v0.8.5-beta.0...v0.8.5-beta.1) (2018-10-31)


### Features

* remove time cost comment ([b8cd946](https://github.com/YMFE/ykit/commit/b8cd946))



<a name="0.8.5-beta.0"></a>
## [0.8.5-beta.0](https://github.com/YMFE/ykit/compare/v0.8.4...v0.8.5-beta.0) (2018-10-25)


### Features

* 关闭自动 hot 功能；会影响部分项目的 resolve 路径；目前原因不明，待后续查找，暂时关闭此功能； ([480481e](https://github.com/YMFE/ykit/commit/480481e))
* 增加 pack min 后的 sourcemap 处理 ([455c291](https://github.com/YMFE/ykit/commit/455c291))
* 更新 docs 地址 ([0720d93](https://github.com/YMFE/ykit/commit/0720d93))



<a name="0.8.4"></a>
## [0.8.4](https://github.com/YMFE/ykit/compare/v0.8.3...v0.8.4) (2018-10-10)


### Bug Fixes

* udpate package version ([0a96d93](https://github.com/YMFE/ykit/commit/0a96d93))



<a name="0.8.3"></a>
## [0.8.3](https://github.com/YMFE/ykit/compare/v0.8.3-beta.1...v0.8.3) (2018-10-10)


### Bug Fixes

* 修复 sourcemap 生成配置参数错误 ([72fa46d](https://github.com/YMFE/ykit/commit/72fa46d))
* 增加 min 模式下生成 sourcemap 的能力 ([f747555](https://github.com/YMFE/ykit/commit/f747555))



<a name="0.8.3-beta.1"></a>
## [0.8.3-beta.1](https://github.com/YMFE/ykit/compare/v0.8.3-beta.0...v0.8.3-beta.1) (2018-07-26)


### Bug Fixes

* change registry to "https://registry.npm.taobao.org" ([701704d](https://github.com/YMFE/ykit/commit/701704d))
* PT-4696 add catch(e) ([a480641](https://github.com/YMFE/ykit/commit/a480641))



<a name="0.8.3-beta.0"></a>
## [0.8.3-beta.0](https://github.com/YMFE/ykit/compare/v0.8.2...v0.8.3-beta.0) (2018-06-08)


### Features

* 增加处理耗时反馈；增加内容压缩；调整中间件顺序 ([ef837ff](https://github.com/YMFE/ykit/commit/ef837ff))



<a name="0.8.2"></a>
## [0.8.2](https://github.com/YMFE/ykit/compare/v0.8.0...v0.8.2) (2018-06-04)


### Bug Fixes

* 修复setuid可能面临的其他错误，并给出警告 ([6ddd6aa](https://github.com/YMFE/ykit/commit/6ddd6aa))
* 增加读取 package.json 错误捕获 ([5e11796](https://github.com/YMFE/ykit/commit/5e11796))


### Features

* 增加 package.json 解析失败错误提示；同时不阻塞 server 正常启动 ([5db7645](https://github.com/YMFE/ykit/commit/5db7645))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/YMFE/ykit/compare/0.7.0...v0.8.0) (2018-05-13)


### Bug Fixes

* 修复当入口为字符串类型时 hot-reload 不生效 ([ba47974](https://github.com/YMFE/ykit/commit/ba47974))
* 去掉 hot-reload 对于 publicPath 的修改 ([0f16000](https://github.com/YMFE/ykit/commit/0f16000))


### Features

* **server:** hot-reload 改为默认行为 ([4fa1e43](https://github.com/YMFE/ykit/commit/4fa1e43))
* add project alias start ([1b8a237](https://github.com/YMFE/ykit/commit/1b8a237))
* 本地环境下不使用 extract 插件 ([49936bd](https://github.com/YMFE/ykit/commit/49936bd))
* 添加 build --production 参数 ([1bd925c](https://github.com/YMFE/ykit/commit/1bd925c))
* 添加 config file 没有找到的警告 ([63b0b3c](https://github.com/YMFE/ykit/commit/63b0b3c))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/YMFE/ykit/compare/0.6.2...0.7.0) (2017-10-16)


### Bug Fixes

* **chunk:** 修复异步加载的 chunk 通过 require.ensure 第三个参数命名无效 ([411c5d4](https://github.com/YMFE/ykit/commit/411c5d4))


### Features

* **cmd:** init 和 build 命令可以添加 registry 参数 ([fc85499](https://github.com/YMFE/ykit/commit/fc85499))



<a name="0.6.2"></a>
## [0.6.2](https://github.com/YMFE/ykit/compare/0.6.1...0.6.2) (2017-09-15)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/YMFE/ykit/compare/0.6.0...0.6.1) (2017-09-08)


### Bug Fixes

* **build:** 修复 extract-text-webpack-plugin 版本问题 ([f01e720](https://github.com/YMFE/ykit/commit/f01e720))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/YMFE/ykit/compare/0.5.5...0.6.0) (2017-09-05)


### Bug Fixes

* fix commonsChunk_filename ext_name bug ([cc7529d](https://github.com/YMFE/ykit/commit/cc7529d))
* fix commonsChunk_filename ext_name bug in the build file ([28aed93](https://github.com/YMFE/ykit/commit/28aed93))
* **server:** 修复项目名称和资源名称相同时访问不到问题 ([79085f6](https://github.com/YMFE/ykit/commit/79085f6))
* 修复 extract-text-webpack-plugin order error ([3f9f90f](https://github.com/YMFE/ykit/commit/3f9f90f))


### Features

* **build:** 去掉 npm cache clean ([0d5fe3d](https://github.com/YMFE/ykit/commit/0d5fe3d))
* **build:** 检测 lock version 文件中是否有官方库，并给出提示 ([e3b3c3d](https://github.com/YMFE/ykit/commit/e3b3c3d))
* **build:** 添加 dev 发布模式 ([7b0922c](https://github.com/YMFE/ykit/commit/7b0922c))
* **pack:** 添加设置 minify 进程池大小配置 ([c05d70b](https://github.com/YMFE/ykit/commit/c05d70b))
* 支持 ts 扩展名 ([a8548b8](https://github.com/YMFE/ykit/commit/a8548b8))



<a name="0.5.5"></a>
## [0.5.5](https://github.com/YMFE/ykit/compare/0.5.4...0.5.5) (2017-08-10)


### Bug Fixes

* commonsChunk config bug ([579bd8d](https://github.com/YMFE/ykit/commit/579bd8d))
* **server:** fix static server cwd error when there is no ykit config file ([3a29c0d](https://github.com/YMFE/ykit/commit/3a29c0d))
* **server:** fix static server error when cwd not exists ([4fccaea](https://github.com/YMFE/ykit/commit/4fccaea))



<a name="0.5.4"></a>
## [0.5.4](https://github.com/YMFE/ykit/compare/0.5.3...0.5.4) (2017-07-25)


### Bug Fixes

* middleware optimization only work when maxMiddleware option exists ([553bf07](https://github.com/YMFE/ykit/commit/553bf07))
* **init:** fix windows 'module' is not defined error when running setup command ([27a38d4](https://github.com/YMFE/ykit/commit/27a38d4))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/YMFE/ykit/compare/0.5.2...0.5.3) (2017-07-12)



<a name="0.5.2"></a>
## [0.5.2](https://github.com/YMFE/ykit/compare/0.5.1...0.5.2) (2017-07-11)


### Bug Fixes

* **server:** fix hot reload not work with middleware optimization ([ab9efc4](https://github.com/YMFE/ykit/commit/ab9efc4))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/YMFE/ykit/compare/0.5.0...0.5.1) (2017-07-11)


### Bug Fixes

* **config:** fix alias path on windows ([c2be8a5](https://github.com/YMFE/ykit/commit/c2be8a5))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/YMFE/ykit/compare/0.4.1...0.5.0) (2017-07-10)


### Bug Fixes

* **config:** fix absolute alias path problem on build env ([9ce86ba](https://github.com/YMFE/ykit/commit/9ce86ba))
* **config:** fix can't find config.commands ([e1e82ef](https://github.com/YMFE/ykit/commit/e1e82ef))
* **pack:** fix pack source map bug ([a6355a0](https://github.com/YMFE/ykit/commit/a6355a0))
* **project:** fix Missing semicolon bug ([5c6ef45](https://github.com/YMFE/ykit/commit/5c6ef45))
* **Project:** Fix vendor  build_file bug and use manifast chunk ([743f349](https://github.com/YMFE/ykit/commit/743f349))
* **server:** fix https server start bug when https  set error cert ([5a41b4e](https://github.com/YMFE/ykit/commit/5a41b4e))


### Features

* **cli:** add watch command ([329f1fe](https://github.com/YMFE/ykit/commit/329f1fe))
* **server:** add host replace middleware ([1c8d850](https://github.com/YMFE/ykit/commit/1c8d850))
* **server:** support starting server inside project ([baee9ea](https://github.com/YMFE/ykit/commit/baee9ea))
* **Server:** support max middleware count ([36c6cad](https://github.com/YMFE/ykit/commit/36c6cad))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/YMFE/ykit/compare/0.4.0...0.4.1) (2017-05-16)


### Bug Fixes

* **config:** fix commands in config function not work ([93b877a](https://github.com/YMFE/ykit/commit/93b877a))
* **server:** fix https server can’t find key file ([1f7779f](https://github.com/YMFE/ykit/commit/1f7779f))


### Features

* **server:** add mocking ([f944bc1](https://github.com/YMFE/ykit/commit/f944bc1))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/YMFE/ykit/compare/0.3.4...0.4.0) (2017-05-02)


### Bug Fixes

* **alias:** fix useing absolute path outside project alias problem ([1336e68](https://github.com/YMFE/ykit/commit/1336e68))
* **hmr:** fix not work on differert host ([b00449a](https://github.com/YMFE/ykit/commit/b00449a))
* **pack:** fix bundling error not throwed ([509c62a](https://github.com/YMFE/ykit/commit/509c62a))
* **pack:** fix using abbr command won’t get correct env ([8dd44de](https://github.com/YMFE/ykit/commit/8dd44de))


### Features

* **pack:** add beforeCompiling hook ([7e9fa6f](https://github.com/YMFE/ykit/commit/7e9fa6f))
* **plugin:** allow config build options ([dfc9e56](https://github.com/YMFE/ykit/commit/dfc9e56))
* **server:** add http-proxy-middleware to handle server proxy ([69cbb63](https://github.com/YMFE/ykit/commit/69cbb63))
* **server:** add overlay option ([cd089e1](https://github.com/YMFE/ykit/commit/cd089e1))



<a name="0.3.4"></a>
## [0.3.4](https://github.com/YMFE/ykit/compare/0.3.3...0.3.4) (2017-04-07)


### Bug Fixes

* **hot:** fix Express wildcard routing breaks ([9e39a0e](https://github.com/YMFE/ykit/commit/9e39a0e))
* **minify:** degrade to uglify-js1 to fix ie8 problem ([b6d5a66](https://github.com/YMFE/ykit/commit/b6d5a66))
* **Project:** typo ([0f90c20](https://github.com/YMFE/ykit/commit/0f90c20))


### Features

* **build:** allow skip building ([0436f55](https://github.com/YMFE/ykit/commit/0436f55))
* **server:** report bundler error by overlay ([e74f1fd](https://github.com/YMFE/ykit/commit/e74f1fd))
* **server:** serve for default favicon ([9193041](https://github.com/YMFE/ykit/commit/9193041))



<a name="0.3.3"></a>
## [0.3.3](https://github.com/YMFE/ykit/compare/0.3.2...0.3.3) (2017-03-22)


### Bug Fixes

* **server:** modify publicPath replacing to shutdown ([8fc1ccc](https://github.com/YMFE/ykit/commit/8fc1ccc))


### Features

* **hooks:** add err handler for hooks ([e4addd1](https://github.com/YMFE/ykit/commit/e4addd1))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/YMFE/ykit/compare/0.3.1...0.3.2) (2017-03-20)


### Bug Fixes

* **server:** 修复 win 下 publicpath 替换问题 ([7a02ba2](https://github.com/YMFE/ykit/commit/7a02ba2))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/YMFE/ykit/compare/0.3.0...0.3.1) (2017-03-20)


### Bug Fixes

* **config:**  修复 exports 项不能设置为数组 ([00e1ec4](https://github.com/YMFE/ykit/commit/00e1ec4))
* **config:** 修复一些情况下 alias 路径设置重复 ([e907691](https://github.com/YMFE/ykit/commit/e907691))
* **config:** 将 context 从 root 中移除 ([803eea5](https://github.com/YMFE/ykit/commit/803eea5))
* **init:** 修复 node_modules 不存在时打包报错 ([32efa04](https://github.com/YMFE/ykit/commit/32efa04))
* **plugin:** 修复由 case-senitive 引起的性能问题 ([0471926](https://github.com/YMFE/ykit/commit/0471926))


### Features

* **pack:** 将 uglify-js 升级到 uglify-js2 ([3a40a2a](https://github.com/YMFE/ykit/commit/3a40a2a))
* **pack:** 打包报错后以返回码 1 退出 ([c34a40c](https://github.com/YMFE/ykit/commit/c34a40c))
* **plugin:** 添加插件读取 ykit.js 配置功能 ([ba9bcd0](https://github.com/YMFE/ykit/commit/ba9bcd0))
* **server:** 支持 —hot 开启热更新 ([941c5d7](https://github.com/YMFE/ykit/commit/941c5d7))
* 支持忽略 node_modules 阻断 ([936ddb5](https://github.com/YMFE/ykit/commit/936ddb5))


### Performance Improvements

* **log:** reform log methods ([4627daa](https://github.com/YMFE/ykit/commit/4627daa))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/YMFE/ykit/compare/0.2.5...0.3.0) (2017-02-20)


### Bug Fixes

* **pack:** 检查是否存在 ExtractTextPlugin，防止重复设置 ([c3b9ab5](https://github.com/YMFE/ykit/commit/c3b9ab5))
* **server:** 修复因为权限降级无法使用 sudo ([d983ae9](https://github.com/YMFE/ykit/commit/d983ae9))
* **server:** 修复因为权限降级无法操作 cache 文件 ([60c2305](https://github.com/YMFE/ykit/commit/60c2305))
* **server:** 修复无法更改 output.path 为非 prd 的形式 ([371fd62](https://github.com/YMFE/ykit/commit/371fd62))
* **source-map:** 使用 webpack-encoding-plugin 修复注释中的中文乱码 ([3b2d8cd](https://github.com/YMFE/ykit/commit/3b2d8cd))


### Features

* **config:** 支持 module.exports 形式配置文件 ([9cebc62](https://github.com/YMFE/ykit/commit/9cebc62))
* **config:** 支持传入一个配置对象 ([0fb9888](https://github.com/YMFE/ykit/commit/0fb9888))
* **config:** 支持通过数组传入 plugin ([4d825b3](https://github.com/YMFE/ykit/commit/4d825b3))
* **init:** 添加 .gitignore ([4e4c842](https://github.com/YMFE/ykit/commit/4e4c842))
* **pack:**  pack 钩子支持同步和异步两种形式 ([043841b](https://github.com/YMFE/ykit/commit/043841b))
* **pack:** 支持 beforePack 和 afterPack ([fd00cb2](https://github.com/YMFE/ykit/commit/fd00cb2))
* **pack:** 添加 beforePackCallbacks 回调 ([27198dd](https://github.com/YMFE/ykit/commit/27198dd))
* **server:**  server 转为 middleware 形式 ([a1736b3](https://github.com/YMFE/ykit/commit/a1736b3))
* **server:** 添加 verbose 配置项，打印出详细编译信息 ([b2d26c7](https://github.com/YMFE/ykit/commit/b2d26c7))


### Performance Improvements

* **server:** 去掉检查大小写插件，提升本地编译速度 ([1701d29](https://github.com/YMFE/ykit/commit/1701d29))



<a name="0.2.5"></a>
## [0.2.5](https://github.com/YMFE/ykit/compare/0.2.4...0.2.5) (2017-01-18)


### Bug Fixes

* **init:** 修复 cnpm 响应太慢，预先去 qnpm 查找 ([6be1085](https://github.com/YMFE/ykit/commit/6be1085))
* **init:** 修复检测包存在超时时间过短 ([e3d6f16](https://github.com/YMFE/ykit/commit/e3d6f16))
* **server:** 修复 js 没有应用后缀转换规则 ([7a5a16e](https://github.com/YMFE/ykit/commit/7a5a16e))


### Features

* **build:** 检测 ykit 配置文件及 node_modules ([960dad3](https://github.com/YMFE/ykit/commit/960dad3))
* **compile:** 添加 jsx 进入默认编译后缀 ([79c3bc5](https://github.com/YMFE/ykit/commit/79c3bc5))
* **server:** 支持  entry.key 路径匹配 ([a138998](https://github.com/YMFE/ykit/commit/a138998))



<a name="0.2.4"></a>
## [0.2.4](https://github.com/YMFE/ykit/compare/0.2.3...0.2.4) (2017-01-09)


### Bug Fixes

* **build:** 兼容不存在 npm_cache_share 的场景 ([cc7483d](https://github.com/YMFE/ykit/commit/cc7483d))


### Features

* **cmd:** 添加 build 命令 ([92d66aa](https://github.com/YMFE/ykit/commit/92d66aa))
* **server:** 添加默认 https 证书 ([5be0261](https://github.com/YMFE/ykit/commit/5be0261))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/YMFE/ykit/compare/0.2.2...0.2.3) (2016-12-29)


### Bug Fixes

* **config:** 修复全局文件不存在时报错 ([33c2ca4](https://github.com/YMFE/ykit/commit/33c2ca4))
* **pack:** 修复 assets 文件名更改后打包资源报错 ([2e301d3](https://github.com/YMFE/ykit/commit/2e301d3))
* 默认不设置 publicPath ([ccedfc2](https://github.com/YMFE/ykit/commit/ccedfc2))


### Features

* **postinstall:** 安装结束后初始化全局配置文件 ([c186c23](https://github.com/YMFE/ykit/commit/c186c23))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/YMFE/ykit/compare/0.2.1...0.2.2) (2016-12-23)


### Bug Fixes

* **config:** 不再寻找全局插件（使用 npm_cache_share) 做缓存策略 ([835fa2b](https://github.com/YMFE/ykit/commit/835fa2b))
* **config:** 不在寻找全局插件（使用 npm_cache_share) 做缓存策略 ([32c1816](https://github.com/YMFE/ykit/commit/32c1816))
* **config:** 不在寻找全局插件（使用 npm_cache_share) 做缓存策略 (+1 squashed commit) ([cf95818](https://github.com/YMFE/ykit/commit/cf95818))
* **pack:** 修复获取压缩文件 size 不准确 ([c0eeb2a](https://github.com/YMFE/ykit/commit/c0eeb2a))
* **pack:** 修复获取资源大小时找不到 .cache 文件报错 ([e23ec8c](https://github.com/YMFE/ykit/commit/e23ec8c))


### Features

* **compile:** 强制模块路径大小写正确 ([0175e78](https://github.com/YMFE/ykit/commit/0175e78))
* **compile:** 强制模块路径大小写正确 ([a89e1d7](https://github.com/YMFE/ykit/commit/a89e1d7))
* **minify:** 提供更友好的压缩错误提示 ([863e843](https://github.com/YMFE/ykit/commit/863e843))
* **pack:** 添加对 build 配置项的支持 ([449c0e8](https://github.com/YMFE/ykit/commit/449c0e8))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/YMFE/ykit/compare/0.2.0...0.2.1) (2016-12-20)


### Bug Fixes

* **pack:** 修复压缩变量参数不生效 ([f7f4fc0](https://github.com/YMFE/ykit/commit/f7f4fc0))
* **server.js:** 修复url中带query时找不到本地资源的bug。 ([00dcb46](https://github.com/YMFE/ykit/commit/00dcb46))


### Features

* **progressBarPlugin.js:** 现在ykit server能够在控制台中显示每次build的时间了。 ([d80c3a0](https://github.com/YMFE/ykit/commit/d80c3a0))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/YMFE/ykit/compare/0.1.8...0.2.0) (2016-12-16)


### Bug Fixes

* **pack:** 修复 chunk 版本号问题 ([06039bf](https://github.com/YMFE/ykit/commit/06039bf))
* **pack:** 修复未调用压缩变量方法导致编译打包报错 ([fc10b01](https://github.com/YMFE/ykit/commit/fc10b01))


### Features

* **cli:** 添加 config 命令用来进行全局配置 ([5e46a70](https://github.com/YMFE/ykit/commit/5e46a70))
* **cli:** 添加 config 命令用来进行全局配置 ([587e4a5](https://github.com/YMFE/ykit/commit/587e4a5))
* **fekit.md:** 迁移fekit新版文档 ([3461856](https://github.com/YMFE/ykit/commit/3461856))
* **fekit.md:** 迁移fekit新版文档 ([f1e6be9](https://github.com/YMFE/ykit/commit/f1e6be9))
* **fekit.md:** 迁移fekit新版文档 ([f2b3cd4](https://github.com/YMFE/ykit/commit/f2b3cd4))
* **fekit.md:** 迁移fekit新版文档 ([c651e4b](https://github.com/YMFE/ykit/commit/c651e4b))
* **fekit.md:** 迁移fekit新版文档 ([37ed6bb](https://github.com/YMFE/ykit/commit/37ed6bb))
* **fekit.md:** 迁移fekit新版文档 ([3443366](https://github.com/YMFE/ykit/commit/3443366))
* **fekit.md:** 迁移fekit新版文档 ([77798e7](https://github.com/YMFE/ykit/commit/77798e7))
* **fekit.md:** 迁移fekit新版文档 ([83f96ae](https://github.com/YMFE/ykit/commit/83f96ae))
* **fekit.md:** 迁移fekit新版文档 ([b7bf84a](https://github.com/YMFE/ykit/commit/b7bf84a))
* **fekit.md:** 迁移fekit新版文档 (+4 squashed commits) ([3572289](https://github.com/YMFE/ykit/commit/3572289))
* **init:** 优化初始化逻辑 ([d5de607](https://github.com/YMFE/ykit/commit/d5de607))
* **init:** 优化初始化逻辑 ([7550ce0](https://github.com/YMFE/ykit/commit/7550ce0))
* **init:** 优化初始化逻辑 ([29b6f33](https://github.com/YMFE/ykit/commit/29b6f33))
* **init:** 完善初始化逻辑 ([6177bb5](https://github.com/YMFE/ykit/commit/6177bb5))
* **init:** 完善插件添加逻辑 ([521b18c](https://github.com/YMFE/ykit/commit/521b18c))
* **server:** beforepack现在可以访问到option参数了 ([328d6b9](https://github.com/YMFE/ykit/commit/328d6b9))
* **server:** https 证书/秘钥改为全局配置 ([288b501](https://github.com/YMFE/ykit/commit/288b501))
* **server:** https 证书/秘钥改为全局配置 ([379c4a5](https://github.com/YMFE/ykit/commit/379c4a5))
* **server:** 添加 js & css 的 Content-Type 响应头 ([77ae900](https://github.com/YMFE/ykit/commit/77ae900))
* **server:** 添加 js & css 的 Content-Type 响应头 ([ff2d4dc](https://github.com/YMFE/ykit/commit/ff2d4dc))
* **server:** 添加 js & css 的 Content-Type 响应头 ([4ec269e](https://github.com/YMFE/ykit/commit/4ec269e))



<a name="0.1.8"></a>
## [0.1.8](https://github.com/YMFE/ykit/compare/0.1.7...0.1.8) (2016-12-09)


### Bug Fixes

* **cli:** 修复自定义命令没有缩写会造成 help 命令报错 ([17f6d7b](https://github.com/YMFE/ykit/commit/17f6d7b))
* **pack:**  修复资源无版本号时编译错误 ([57a77cc](https://github.com/YMFE/ykit/commit/57a77cc))
* **pack:** 修复自身版本号使用 webpack-md5-hash 时问题 ([2da0378](https://github.com/YMFE/ykit/commit/2da0378))
* **server:** 修复 rebuild 结束没有给出明显提示 ([9036cbc](https://github.com/YMFE/ykit/commit/9036cbc))


### Features

* **init:** 修改fekit项目的config文件模板，因为fekit项目支持一键导入，所以所有的配置都可以直接从fekit.config中读取了。 ([9f94e87](https://github.com/YMFE/ykit/commit/9f94e87))
* **init:** 初始化改为只生成一个空工程 ([ab08750](https://github.com/YMFE/ykit/commit/ab08750))
* **init:** 初始化模板文件改为 ykit.js ([48b979e](https://github.com/YMFE/ykit/commit/48b979e))
* **init:** 提供初始化模板 ([a3b8814](https://github.com/YMFE/ykit/commit/a3b8814))
* **pack:** 使用 uglify 进行压缩 (+1 squashed commit) ([cb151c7](https://github.com/YMFE/ykit/commit/cb151c7))
* **pack:** 给出明确 optimize 提示 ([3e67b01](https://github.com/YMFE/ykit/commit/3e67b01))


### Performance Improvements

* **pack:** 优化 pack log ([c814175](https://github.com/YMFE/ykit/commit/c814175))



<a name="0.1.7"></a>
## [0.1.7](https://github.com/YMFE/ykit/compare/0.1.6...0.1.7) (2016-12-02)


### Bug Fixes

* 修复 map 文件返回错误 ([1f0f055](https://github.com/YMFE/ykit/commit/1f0f055))
* 修复 ora 不支持 node 0.12 ([c9d7120](https://github.com/YMFE/ykit/commit/c9d7120))
* 修复 windows 下入口路径匹配问题 ([21a372d](https://github.com/YMFE/ykit/commit/21a372d))
* 修复找不到配置模块会重置 .ykitrc ([c1a03d5](https://github.com/YMFE/ykit/commit/c1a03d5))
* **server:** 修复自身定义的 chunk 方式 ([40e147a](https://github.com/YMFE/ykit/commit/40e147a))
* 修复设置 entry 有语法问题时二次报错 ([d983709](https://github.com/YMFE/ykit/commit/d983709))
* **pack:** 修复找不到删除的 .cache 文件 ([57fd410](https://github.com/YMFE/ykit/commit/57fd410))
* **Project:** 用户配置对象使用了export保留字作为属性，为了兼容性考虑继续支持，但另外提供正确的属性名exports作为以后的推荐配置。 ([4095833](https://github.com/YMFE/ykit/commit/4095833))
* **server:** js文件入口不存在时，依然会等待其他资源编译结束resolve而不是直接返回404，这时候会变成一个永远pending的请求。 ([2193385](https://github.com/YMFE/ykit/commit/2193385))
* **server:** 修复路径问题 ([ba291a6](https://github.com/YMFE/ykit/commit/ba291a6))
* **server:** 修改权限不足错误提示 ([e8cb6a4](https://github.com/YMFE/ykit/commit/e8cb6a4))
* **server:** 修改配置，去除 qunar 内容 ([f18aff1](https://github.com/YMFE/ykit/commit/f18aff1))
* 修复额外资源没有去掉版本号 ([83ff4d1](https://github.com/YMFE/ykit/commit/83ff4d1))
* 去掉 pack 二次回调 ([d3e1c1c](https://github.com/YMFE/ykit/commit/d3e1c1c))
* 移除多余测试文件 ([4b3a960](https://github.com/YMFE/ykit/commit/4b3a960))
* **server:** 同步 lib/server.js ([7583c94](https://github.com/YMFE/ykit/commit/7583c94))
* **server:** 完善js文件404错误提示 ([a5b029f](https://github.com/YMFE/ykit/commit/a5b029f))
* **server:** 完善js文件404错误提示，修改状态码为404 ([36bc9fa](https://github.com/YMFE/ykit/commit/36bc9fa))
* **server:** 将server等待时间减少到100ms提升server响应速度 ([3a21d5e](https://github.com/YMFE/ykit/commit/3a21d5e))
* **server:** 添加默认 chunk 配置，修改未找到资源的 404 返回 ([6dda6d1](https://github.com/YMFE/ykit/commit/6dda6d1))
* **server.js:** 开发服务在入口找不到时一直pending的错误修复 ([5c3fbdf](https://github.com/YMFE/ykit/commit/5c3fbdf))


### Features

* **Config:** 增加beforepack钩子 ([14f3e0d](https://github.com/YMFE/ykit/commit/14f3e0d))
* **pack:** 允许在 packCallback 中更改 assetsInfo ([f263f05](https://github.com/YMFE/ykit/commit/f263f05))
* **server:** time to 0.1.7 ([cc12792](https://github.com/YMFE/ykit/commit/cc12792))
* 添加 hacky 方式获取内部 webpack ([ed44919](https://github.com/YMFE/ykit/commit/ed44919))
* **server:** 使用 https 选项同时可以开启正常 http server ([a05480e](https://github.com/YMFE/ykit/commit/a05480e))
* **server:** 延迟 404 的请求直到编译结束（使得编译副产物可以被请求到） ([9b7fb2c](https://github.com/YMFE/ykit/commit/9b7fb2c))
* **server:** 采用新的 compile & watch 机制 ([09e1697](https://github.com/YMFE/ykit/commit/09e1697))
* **server:** 采用新的 logger 风格 ([4b4fbce](https://github.com/YMFE/ykit/commit/4b4fbce))
* 添加 harmonize 运行环境 ([f2aa43d](https://github.com/YMFE/ykit/commit/f2aa43d))
* **server.js:** applyMiddleware API升级，现在允许用户调用多次绑定多个Middleware，它们将会按照绑定顺序依次执行。 ([eadd1c9](https://github.com/YMFE/ykit/commit/eadd1c9))
* **server.js:** applyMiddleware API升级，现在允许用户调用多次绑定多个Middleware，它们将会按照绑定顺序依次执行。 ([afd868b](https://github.com/YMFE/ykit/commit/afd868b))



<a name="0.1.6"></a>
## [0.1.6](https://github.com/YMFE/ykit/compare/0.1.5...0.1.6) (2016-11-18)


### Bug Fixes

* 修复打出冗余 log ([c72bb40](https://github.com/YMFE/ykit/commit/c72bb40))
* **pack:** 去掉重复的packCallback调用 ([923dbc1](https://github.com/YMFE/ykit/commit/923dbc1))
* **server:** 修复 entry 路径匹配不准 ([7c5a2f8](https://github.com/YMFE/ykit/commit/7c5a2f8))
* **server:** 解决入口没找到时compile全部资源的问题 ([e26a8bc](https://github.com/YMFE/ykit/commit/e26a8bc))
* 修复找不到从入口引用的 css ([9855caf](https://github.com/YMFE/ykit/commit/9855caf))
* 修复没有错误提示 ([e6c4778](https://github.com/YMFE/ykit/commit/e6c4778))


### Features

* **server:** 由显示所有本机 ip 改为只显示 127.0.0.1 ([145d4e5](https://github.com/YMFE/ykit/commit/145d4e5))
* 去掉 stylelint 以提升安装速度 ([06363d7](https://github.com/YMFE/ykit/commit/06363d7))
* 添加 command abbr ([1080784](https://github.com/YMFE/ykit/commit/1080784))
* 添加 command abbr ([0a63ff7](https://github.com/YMFE/ykit/commit/0a63ff7))
* 添加 command abbr ([cf428c9](https://github.com/YMFE/ykit/commit/cf428c9))



<a name="0.1.5"></a>
## [0.1.5](https://github.com/YMFE/ykit/compare/0.1.4...0.1.5) (2016-11-14)


### Bug Fixes

* changelog commit id ([4473b7c](https://github.com/YMFE/ykit/commit/4473b7c))
* resolve.alias 不能带 $ ([fb250a7](https://github.com/YMFE/ykit/commit/fb250a7))
* 修复 alias 不生效 ([1506eb8](https://github.com/YMFE/ykit/commit/1506eb8))
* 修复 alias 中对于 { xyz: "/some/dir" } 的适配 ([ccbffb5](https://github.com/YMFE/ykit/commit/ccbffb5))
* 修复 css 版本号引路径而变更 ([9371d2e](https://github.com/YMFE/ykit/commit/9371d2e))
* 修复 webpack 编译过程中无法停止进程 ([bab94b8](https://github.com/YMFE/ykit/commit/bab94b8))
* 修复方法拼写错误 ([313b1b0](https://github.com/YMFE/ykit/commit/313b1b0))
* 修复无法正确关闭代理 ([5ca9685](https://github.com/YMFE/ykit/commit/5ca9685))
* 修复无法设置分组入口 ([e39eb9a](https://github.com/YMFE/ykit/commit/e39eb9a))
* 去掉冗余 pack log ([0513269](https://github.com/YMFE/ykit/commit/0513269))
* 添加必要依赖 ([7de4b86](https://github.com/YMFE/ykit/commit/7de4b86))


### Features

* server 启动时i会使用 config.output.local ([73959eb](https://github.com/YMFE/ykit/commit/73959eb))
* 使业务可以获取当前 ykit 环境 ([08dc33d](https://github.com/YMFE/ykit/commit/08dc33d))
* 所有静态资源支持跨域 ([17d1139](https://github.com/YMFE/ykit/commit/17d1139))



<a name="0.1.4"></a>
## [0.1.4](https://github.com/YMFE/ykit/compare/0.1.3...0.1.4) (2016-10-21)


### Bug Fixes

* **lib:** 同步cli.js与ykit.common.js ([3a7de72](https://github.com/YMFE/ykit/commit/3a7de72))
* **pack:** 修复pack -m参数parse报错 ([a7d3fb1](https://github.com/YMFE/ykit/commit/a7d3fb1))
* 去掉冗余文件 ([6833706](https://github.com/YMFE/ykit/commit/6833706))
* **pack:** 修复打包错误重复输出 ([50b40ce](https://github.com/YMFE/ykit/commit/50b40ce))
* **server:** 修复编译config返回undefined时报错 ([b9c3eb8](https://github.com/YMFE/ykit/commit/b9c3eb8))


### Features

* **config:** 支持返回对象设置config ([b8fb717](https://github.com/YMFE/ykit/commit/b8fb717))
* **config:** 添加设置分组入口 ([11890bf](https://github.com/YMFE/ykit/commit/11890bf))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/YMFE/ykit/compare/0.1.2...0.1.3) (2016-10-12)


### Bug Fixes

* **compile:** 修复同目录下同名不同后缀文件编译冲突 ([531d3fb](https://github.com/YMFE/ykit/commit/531d3fb))
* **lint:** 修复找不到eslintrc问题 ([127206d](https://github.com/YMFE/ykit/commit/127206d))
* **lint:** 修复找不到lint配置文件extends字段 ([1a33339](https://github.com/YMFE/ykit/commit/1a33339))
* **log:** 修复在windows上log频繁问题 ([37ddf51](https://github.com/YMFE/ykit/commit/37ddf51))
* **min:** 修复pack -m mangle参数配置问题 ([e7a53c6](https://github.com/YMFE/ykit/commit/e7a53c6))
* **server:** 修复ext插件找不到编译路径问题 ([e37dcf6](https://github.com/YMFE/ykit/commit/e37dcf6))
* **server:** 修复windows下重复设置header报错 ([aba0339](https://github.com/YMFE/ykit/commit/aba0339))
* **server:** 修复windows下重复设置header报错 ([ef53bb0](https://github.com/YMFE/ykit/commit/ef53bb0))


### Features

* **lint:** 添加qunar默认lint规则 ([f017f5f](https://github.com/YMFE/ykit/commit/f017f5f))
* **lint:** 添加可配置lint文件类型 ([ee6b0d5](https://github.com/YMFE/ykit/commit/ee6b0d5))
* **pack:** 添加pack静默模式 ([f5b9139](https://github.com/YMFE/ykit/commit/f5b9139))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/YMFE/ykit/compare/0.1.1...0.1.2) (2016-10-09)


### Bug Fixes

* **pack:** 修复build机器上找不到process.stderr报错 ([6424cd2](https://github.com/YMFE/ykit/commit/6424cd2))
* **reload:** 修复not in gzip format解压报错 ([8761301](https://github.com/YMFE/ykit/commit/8761301))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/YMFE/ykit/compare/0.1.0...0.1.1) (2016-10-08)


### Bug Fixes

* **fileName:** 修复formatOutput插件命名错误 ([cebc126](https://github.com/YMFE/ykit/commit/cebc126))
* **pack:** 修复progress插件文件命名错误 ([d48dac9](https://github.com/YMFE/ykit/commit/d48dac9))
* **pack:** 修复警告输出报错 ([43e08b2](https://github.com/YMFE/ykit/commit/43e08b2))
* **server:** 修复按请求编译css时入口filter未生效 ([ef45fac](https://github.com/YMFE/ykit/commit/ef45fac))
* **server:** 修复请求资源中带query引起的重复编译 ([751c1a6](https://github.com/YMFE/ykit/commit/751c1a6))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/YMFE/ykit/compare/0.0.5...0.1.0) (2016-09-27)


### Bug Fixes

* **reload:** 修复指定服务地址不生效 ([2e23f7c](https://github.com/YMFE/ykit/commit/2e23f7c))


### Features

* **reload:** 增加从ykit服务拉取插件功能 ([7382ef5](https://github.com/YMFE/ykit/commit/7382ef5))



<a name="0.0.5"></a>
## [0.0.5](https://github.com/YMFE/ykit/compare/0.0.4...0.0.5) (2016-09-09)


### Bug Fixes

* **eslint:** 修复eslint无法extend, 提供lint设置接口 ([56a4983](https://github.com/YMFE/ykit/commit/56a4983))
* **eslint:** 修复找不到全局eslint报错 ([a9c60ee](https://github.com/YMFE/ykit/commit/a9c60ee))
* **file:** 添加之前全局忽略的Config.js ([b613863](https://github.com/YMFE/ykit/commit/b613863))
* **lib:** 去掉多余编译文件 ([c6f8c80](https://github.com/YMFE/ykit/commit/c6f8c80))
* **live reload:** 修复有时live reload 不生效 ([1401222](https://github.com/YMFE/ykit/commit/1401222))
* **node 0.12:** 替换Object.assign为extend ([64deff2](https://github.com/YMFE/ykit/commit/64deff2))
* **pack:** 修复windows下移除目录命令不生效 ([f5b6d0e](https://github.com/YMFE/ykit/commit/f5b6d0e))
* **plugin:** 修复找不到本地ykit-config-xxx ([faa5a8b](https://github.com/YMFE/ykit/commit/faa5a8b))
* **server:** 为watch入口添加interval，防止自动储存引发性能问题 ([ab7c1b0](https://github.com/YMFE/ykit/commit/ab7c1b0))
* **server:** 修复extend config导致sass loader不生效 ([96962a7](https://github.com/YMFE/ykit/commit/96962a7))
* **server:** 修复node_modules中resolve extension不生效 ([b81f867](https://github.com/YMFE/ykit/commit/b81f867))
* **server:** 修复watch文件可能造成内存泄露问题 ([9a59d61](https://github.com/YMFE/ykit/commit/9a59d61))
* **server:** 修复更改入口以后服务 / 打包报错 ([1880c2f](https://github.com/YMFE/ykit/commit/1880c2f))
* **server:** 修复测试目录 ([7e229e9](https://github.com/YMFE/ykit/commit/7e229e9))
* **source map:** 修复babel-loader在webpack中source map不生效问题 ([7f5378f](https://github.com/YMFE/ykit/commit/7f5378f))


### Features

* **cmd:** 增加-v和-h指令 ([f645595](https://github.com/YMFE/ykit/commit/f645595))
* **init:** 添加初始化说明，支持无默认类型 ([e6563ab](https://github.com/YMFE/ykit/commit/e6563ab))
* **lint:** 根据lint结果返回不同值 ([05a17d9](https://github.com/YMFE/ykit/commit/05a17d9))
* **logger:** 编译状态log加上时间 ([b8e2630](https://github.com/YMFE/ykit/commit/b8e2630))
* **plugin:** 添加搜寻全局插件模式 ([e3554bc](https://github.com/YMFE/ykit/commit/e3554bc))
* **server:** 支持https ([a6bac57](https://github.com/YMFE/ykit/commit/a6bac57))
* **server:** 默认改为按请求资源打包，整体打包改为可选参数 ([92ecfa3](https://github.com/YMFE/ykit/commit/92ecfa3))



<a name="0.0.4"></a>
## [0.0.4](https://github.com/YMFE/ykit/compare/0.0.3...0.0.4) (2016-08-26)


### Bug Fixes

* **init:** 修复重写package.json问题 ([e0462e5](https://github.com/YMFE/ykit/commit/e0462e5))
* **server:** 修复404一直pending ([7136403](https://github.com/YMFE/ykit/commit/7136403))
* **server:** 修复一些情况compile报错未显示 ([aa9a1e2](https://github.com/YMFE/ykit/commit/aa9a1e2))


### Features

* **server:** 优化报错信息 ([7483355](https://github.com/YMFE/ykit/commit/7483355))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/YMFE/ykit/compare/0.0.2...0.0.3) (2016-08-15)


### Bug Fixes

* **config:** 修复setCompile报错 ([ef9f345](https://github.com/YMFE/ykit/commit/ef9f345))
* **server:** 修复打包大文件时第一次渲染失败 ([b29d873](https://github.com/YMFE/ykit/commit/b29d873))
* **server:** 修复资源过大时第一次渲染失败 ([f4e9a12](https://github.com/YMFE/ykit/commit/f4e9a12))


### Features

* **server:** 检测到config文件变化后可以重新生成compiler ([423d485](https://github.com/YMFE/ykit/commit/423d485))



<a name="0.0.2"></a>
## [0.0.2](https://github.com/YMFE/ykit/compare/4615fd0...0.0.2) (2016-08-11)


### Bug Fixes

* **config:** 修复设置loaders不生效 ([b904079](https://github.com/YMFE/ykit/commit/b904079))
* **config:** 初始context改为src ([70be3c7](https://github.com/YMFE/ykit/commit/70be3c7))
* **fixcss:** 修复寻找cache路径 ([d4e14ac](https://github.com/YMFE/ykit/commit/d4e14ac))
* **fixCss:** 修复在不同context下.cache路径问题 ([f679c63](https://github.com/YMFE/ykit/commit/f679c63))
* **fixes:** 修复css路径 ([040b519](https://github.com/YMFE/ykit/commit/040b519))
* **init:** 优化初始化流程 ([703ef3b](https://github.com/YMFE/ykit/commit/703ef3b))
* **init:** 去掉全局引用的shelljs ([3a8086e](https://github.com/YMFE/ykit/commit/3a8086e))
* **init:** 改为从gitlab上安装配置 ([18ac575](https://github.com/YMFE/ykit/commit/18ac575))
* **initTmpl:** 去掉默认用户选项 ([6c47c8d](https://github.com/YMFE/ykit/commit/6c47c8d))
* **install:** proxy改为使用时提示安装 ([877896c](https://github.com/YMFE/ykit/commit/877896c))
* **install proxy:** 检测权限 ([52d788a](https://github.com/YMFE/ykit/commit/52d788a))
* **js-loader:** 优化正则 ([39c8119](https://github.com/YMFE/ykit/commit/39c8119))
* **lint:** remove log ([353ac74](https://github.com/YMFE/ykit/commit/353ac74))
* **lint:** 优先使用项目配置的linter ([c592569](https://github.com/YMFE/ykit/commit/c592569))
* **lint:** 优化lint提示 ([39bf20f](https://github.com/YMFE/ykit/commit/39bf20f))
* **lint:** 修复context改变时lint路径问题 ([7030fa7](https://github.com/YMFE/ykit/commit/7030fa7))
* **lint:** 修复jsx没有被lint ([ce1fa37](https://github.com/YMFE/ykit/commit/ce1fa37))
* **lint:** 修复没有使用到本地lint规则 ([53498bb](https://github.com/YMFE/ykit/commit/53498bb))
* **lint:** 修复没有使用到本地lint规则 ([13d2a3f](https://github.com/YMFE/ykit/commit/13d2a3f))
* **logger:** 优化pack/server logger ([c003504](https://github.com/YMFE/ykit/commit/c003504))
* **pack:** min err ([f016a5f](https://github.com/YMFE/ykit/commit/f016a5f))
* **pack:** 修改默认context ([c91715d](https://github.com/YMFE/ykit/commit/c91715d))
* **package.json:** lint和livereload不在初始默认安装，而是调用命令式提示安装 ([72466b9](https://github.com/YMFE/ykit/commit/72466b9))
* **path:** 兼容windows path ([a8d90ff](https://github.com/YMFE/ykit/commit/a8d90ff))
* **Project:** 修复找不到this.options ([ea22ae6](https://github.com/YMFE/ykit/commit/ea22ae6))
* **QProxy:** 兼容windows ([f46ccb6](https://github.com/YMFE/ykit/commit/f46ccb6))
* **readrc:** 如果没有rc不报错，在init时reload ([ffbd178](https://github.com/YMFE/ykit/commit/ffbd178))
* **reload:** 修复找不到manager ([3da7549](https://github.com/YMFE/ykit/commit/3da7549))
* **server:** logger url改用相对路径（考虑一些工程相对路径已经很长了...所以不用绝对路径） ([d2e6dc5](https://github.com/YMFE/ykit/commit/d2e6dc5))
* **server:** 优化server启动报错提示 ([e36c697](https://github.com/YMFE/ykit/commit/e36c697))
* **server log:** 修复文件大小单位格式 ([c1055ec](https://github.com/YMFE/ykit/commit/c1055ec))
* **server logger:** 更改打包文件显示单位 ([11f7094](https://github.com/YMFE/ykit/commit/11f7094))
* **setConfig:** 修复setConfig中上下文环境不对 ([2c12155](https://github.com/YMFE/ykit/commit/2c12155))
* **setConfig:** 修复返回undefined时报错 ([cdc1ad3](https://github.com/YMFE/ykit/commit/cdc1ad3))
* **setConfig:** 支持设置context相对路径 ([6afd43d](https://github.com/YMFE/ykit/commit/6afd43d))


### Features

* **alias:** 兼容fekit形式alias ([c9ff1b9](https://github.com/YMFE/ykit/commit/c9ff1b9))
* **cmd:** 添加init ([768a387](https://github.com/YMFE/ykit/commit/768a387))
* **compile:** 自动添加context为resolve.root ([8c6302c](https://github.com/YMFE/ykit/commit/8c6302c))
* **env:** 支持node 0.12 ([4380c73](https://github.com/YMFE/ykit/commit/4380c73))
* **ext plguin:** 支持js后缀转换 ([f4578c8](https://github.com/YMFE/ykit/commit/f4578c8))
* **global:** 添加全局log方法 ([8cb0c61](https://github.com/YMFE/ykit/commit/8cb0c61))
* **gulp:** 第一次启动时也编译 ([385748d](https://github.com/YMFE/ykit/commit/385748d))
* **init:** 添加xta/none init选项 ([e4330fc](https://github.com/YMFE/ykit/commit/e4330fc))
* **lint:** add lint command and example ([73bb6be](https://github.com/YMFE/ykit/commit/73bb6be))
* **lint:** lint可以指定目录/文件 ([9d21d95](https://github.com/YMFE/ykit/commit/9d21d95))
* **pack:** add -m/--min option ([50cc200](https://github.com/YMFE/ykit/commit/50cc200))
* **pack:** add css-loader ([09d2391](https://github.com/YMFE/ykit/commit/09d2391))
* **pack:** add CssEntryLoaderPlugin ([7a3eecf](https://github.com/YMFE/ykit/commit/7a3eecf))
* **pack:** add es6 compiler ([51d5dda](https://github.com/YMFE/ykit/commit/51d5dda))
* **pack:** add pack command demo & test ([4615fd0](https://github.com/YMFE/ykit/commit/4615fd0))
* **pack:** add source map opt ([3a655f2](https://github.com/YMFE/ykit/commit/3a655f2))
* **pack:** 可配置打包前是否清空输出目录 ([eac936a](https://github.com/YMFE/ykit/commit/eac936a))
* **pack:** 显示错误详细信息 ([4f592be](https://github.com/YMFE/ykit/commit/4f592be))
* **pack:** 添加打包进度条 ([9e93625](https://github.com/YMFE/ykit/commit/9e93625))
* **pack:** 添加设置分组参数 ([551c0b4](https://github.com/YMFE/ykit/commit/551c0b4))
* **pack logger:** 添加打包log ([141fb55](https://github.com/YMFE/ykit/commit/141fb55))
* **package.json:** 添加jerryproxy作为初始组件 ([0e086ef](https://github.com/YMFE/ykit/commit/0e086ef))
* **server:** add live reload ([e77692b](https://github.com/YMFE/ykit/commit/e77692b))
* **server:** add logger ([dc8ad5f](https://github.com/YMFE/ykit/commit/dc8ad5f))
* **server:** add server command ([e93c20f](https://github.com/YMFE/ykit/commit/e93c20f))
* **server:** add source map ([c09678f](https://github.com/YMFE/ykit/commit/c09678f))
* **server:** 优化error/warning log信息 ([c70b54c](https://github.com/YMFE/ykit/commit/c70b54c))
* **server:** 添加代理功能 ([3189f29](https://github.com/YMFE/ykit/commit/3189f29))
* **server/pack:** 支持入口为数组 ([bbb5808](https://github.com/YMFE/ykit/commit/bbb5808))
* **setConfig:** 添加对alias处理 ([e2b41ce](https://github.com/YMFE/ykit/commit/e2b41ce))




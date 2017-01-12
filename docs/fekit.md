<h1 style="font-weight: normal"> 将FEkit项目迁移到YKit </h1>

** 注意：迁移所需npm至少为3以上，请先检查npm版本。 **

<h2 style="font-weight:normal"> 生成package.json </h2>

首先需要调用 `` npm init ``生成package.json文件，一路点回车即可。

<h2 style="font-weight: normal"> 下载依赖 </h2>

迁移所需要的依赖是`@qnpm/ykit-config-fekit`包：

```
qnpm i @qnpm/ykit-config-fekit --save
```

然后包的postinstall脚本会帮你创建`ykit.fekit.js`到项目根目录下。

所有fekit.config中的有效配置（和构建和发布相关的配置）会被拷贝到ykit.fekit.js中，今后在这个文件中修改即可。

目前没有计划支持fekit install和fekit plugin（例如qmb）相关的配置项。

** 你需要将package.json和ykit.fekit.js两个文件加入到git版本控制中（调用git add），node_modules不需要add。 **

<h2 style="font-weight: normal"> 尝试迁移 </h2>

** 以下内容非常重要，请仔细阅读后再进行操作 **

<h3 style="font-weight: normal"> 目前不支持的项目类型： </h3>

- 使用了`scripts`(premin,prepack,postmin,postpack,prepublish)钩子脚本的项目
- 各种利用了非常规fekit bug的项目（例如使用注释来require依赖）
- 配置compile:false的项目

以上几类项目目前完全无法迁移，会逐次提供支持，请等待之后版本的ykit-config-fekit。

另外，如果是先使用webpack构建再用FEkit发布的项目，也可以迁移，但是需要手动执行webpack构建过程先生成pack后的文件。

<h3 style="font-weight: normal"> 可能存在的问题 </h3>

目前发现FEKit的模块加载器并未严格遵守CommonJS标准，它的模块ID和文件内容的md5 hash相关，这在一部分依赖了全局变量的项目中可能会导致大bug。
根本原因是：某些文件内容相同的模块，在FEKit下会被编译成一个module，而在YKit下是两个。

举例说明，假如项目中依赖了avalon.js又依赖了oniui，这表面上不会有问题，但是oniui内部的fekit_modules文件夹包含了avalon的依赖，这两个文件的内容完全相同，
这会导致在YKit构建出来的js中avalon.js中的逻辑被执行两次，而FEKit构建的js只会执行一次（实际上，YKit的构建结果才是正确的）。
由于avalon的插件如`mmRequest`,`mmPromise`都是扩展的window.avalon对象，执行两次avalon.js的结果就是
之前挂载的插件会被完全覆盖。这将导致整个项目不可用。

如果在迁移后控制台报出某个全局变量的方法找不到的错误，就很有可能是这种问题。目前这一类项目还没找到快捷的迁移方法，请先不要独自尝试。

<h3 style="font-weight: normal"> 迁移步骤 </h3>

<h4 style="font-weight: normal"> 1. 本地pack </h4>

首先请在项目根目录下调用`ykit pack -c`生成dev文件。然后注意看一下命令行可能出现的报错，例如：

```
 X ./~/css-loader?-url!./~/@qnpm/ykit-config-fekit/loaders/fekit-scss.js!./src/styles/expcleisure-index.css
Module build failed: Missed semicolon (87:127)

  85 | .b_event_description{ padding-bottom:10px; }
  86 | .b_event_description .e_process{ padding:15px 0 8px 85px; text-align:center; }
> 87 | .b_event_description .e_process li{ margin-left:12px; padding-right:36px; width:158px; display:inline; float:left; background:background:url(http://source.qunar.com/site/images/zhuanti/130424-1/icon.png) no-repeat 100% 44px; }
     |                                                                                                                               ^
  88 | .b_event_description .e_process li.last{ background:none; }
  89 | .b_event_description .e_process .step_01, .b_event_description .e_process .step_02, .b_event_description .e_process .step_03, .b_event_description .e_process .step_04{ width:158px; height:114px; background:url(http://source.qunar.com/site/images/zhuanti/130424-1/step.png) no-repeat 0 0; overflow:hidden; }
  90 | .b_event_description .e_process .step_02{ background-position:0 -125px; }
```

由于FEkit不会校验css的语法，因此我们发现大部分的项目都存在类似的各种css错误，这在ykit不再被允许，你需要手动修改这些错误以后再尝试迁移。

另外一种错误是样式的循环依赖问题，例如在文件a中有`` @import 'a'; ``的语句，这在FEKit中会被默默无视，但是在YKit里不再被允许。
在构建过程中你可以看到如下的错误提示：

```
X ./~/css-loader?-url!./~/@qnpm/ykit-config-fekit/loaders/fekit-scss.js!./src/yo/endorse-progress/page/endorse-progress.scss
Module build failed: Error: [ykit-config-fekit]: 发现循环依赖config，位于文件/Users/chenjiao/Documents/qzz/complaint/src/yo/endorse-progress/core/config.scss中，请检查。
```

请修复错误以后再继续尝试。

另外，在js中也可能出现语法错误，例如：

```
X ./src/scripts/a/touch/recruitSleeper/index.js
Module not found: Error: Cannot resolve module 'prepareSleeper/index/js' in /Users/chenjiao/Documents/qzz/ugc/src/scripts/a/touch/recruitSleeper
 @ ./src/scripts/a/touch/recruitSleeper/index.js 5:0-34
```

这个错误对应的源码长这个样子：

```
require("prepareSleeper/index/js");
```

这种错误在fekit中也被默默地无视掉了，请参照报错信息进行修改。

请重复以上两个步骤，直到没有报错为止。

<h4 style="font-weight: normal"> 2. dev测试 </h4>

调用``ykit sync``可以将项目sync到开发机，然后请修改host进行dev测试（这个就不多说怎么弄了）。

最好每个页面都看一下是否有问题。

<h4 style="font-weight: normal"> beta/正式发布 </h4>

按流程走即可。

<h2 style="font-weight: normal"> 支持 </h2>

请qtalk jiao.shen或者yuhao.ju

<h2 style="font-weight: normal"> 已经转化成功的项目列表 </h2>

注意，以下的项目绝大多数都有上面提到的css语法问题和js引用问题，都是手动修复以后转化成功的：

- ugc_mall
- ugc
- ugchybrid
- ugc_mall_admin
- ugc_review_audit
- ugc_topic
- trainticket
- hotel_fekit
- bnb_fekit
- bnbhybrid
- hotel_luxury
- mice_search_fekit
- mice_operation_fekit

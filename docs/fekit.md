# 将FEkit项目迁移到YKit

## 下载依赖

迁移所需要的依赖是`ykit-config-fekit`包：

```
qnpm i @qnpm/ykit-config-fekit
```

然后包的postinstall脚本会帮你创建`ykit.fekit.js`到项目根目录下。

和其他ykit项目不同的是你不需要写任何配置项，里面可配置的只有sync到开发机的命令。所有的相关配置都会从fekit.config中读取。

## 尝试迁移

** 以下内容非常重要，请仔细阅读后再进行操作 **

### 目前不支持的项目类型：

- 使用了`scripts`钩子脚本的项目
- 使用less的项目
- 各种利用了非常规fekit bug的项目（例如使用注释来require依赖）

以上三类项目目前完全无法迁移，请等待下一版本的ykit-config-fekit。

### 迁移步骤

#### 1. 本地pack

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

#### 2. dev测试

调用``ykit sync``可以将项目sync到开发机，然后请修改host进行dev测试（这个就不多说怎么弄了）。

最好每个页面都看一下是否有问题。

#### beta/正式发布

按流程走即可。

## 支持

请qtalk jiao.shen或者yuhao.ju
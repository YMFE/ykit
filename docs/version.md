<h2 style="font-weight: normal"> 背景介绍 </h2>

前端工程构建之后，会产生一批版本号资源，那么在后端工程的模版里，需要在(vm/jsp)里引入css、js资源的时候，写法大概是这样的：

```html
<script src="http://q.qunarzz.com/piao_crm/prd/scripts/supplier/listpage@#include("/include/ver/scripts/supplier/listpage.js.ver").js" type="text/javascript" charset="utf-8"></script>
```

这样可以使得后端能够关联到前端的资源文件，但是主要存在如下**几个问题**：

1.需要在@之后写一坨，页面中加上css，页面引入的资源多了，源代码可读性降低。

2.需要在每一个模版里都去关心要引入的js对应的版本号文件地址，降低开发效率，而且累。

3.前端工程在新增引入或者后期维护的时候，改一个路径，也要跑到后端工程去改这个地方。

4.后端的include是一般都是运行时执行的，每一个页面都会引发服务器的IO读取。

<h2 style="font-weight: normal"> 期待效果 </h2>

其实对于开发人员来说，版本应该是框架/工具层面解决的问题，精力应该专注在代码本身，应该有更简练的写法，比如这样的：

```html
<script src="http://q.qunarzz.com/piao_crm/prd/scripts/supplier/listpage@ver.js" type="text/javascript" charset="utf-8"></script>
```

<h2 style="font-weight: normal"> 解决方案 </h2>

有了背景和期望，该如何解决这个问题呢？该在哪个阶段解决这个问题呢？

发布后端工程的时候，会找后端工程pom.xml里配置的maven插件并执行，依据pom中配置的前端发布tag，从maven仓库将前端版本号资源拉取到指定目录下，供后续vm里面去include。

其实我们可以往下再做一步，将拉过来的version自动匹配到模板里并替换。

这样一来，在开发引入资源的时候无需关注版本号的问题，而且这个是物理上的替换，待到工程运行的时候，已经是带上版本号的了，消耗上也会比运行时include少一些。

因此开发了一个maven插件来解决这个问题，只需要在maven中配置即可。如果是其它类型的工程，这个插件也可以导出为一个jar包传参数运行，看具体的使用场景。

<h2 style="font-weight: normal"> 如何使用 </h2>

<b style="color: red"> 注：最新版本为1.0.9，强烈建议使用最新版本，如果使用1.0.9之前版本，除了配置下面的plugin外，还需要配置copy-maven-plugin。 </b>

在后端工程的pom.xml里的build--》plugins节点里增加如下配置即可：

```xml
<plugin>
    <groupId>com.qunar.maven.plugins</groupId>
    <artifactId>fekit-maven-plugin</artifactId>
    <version>1.0.9</version> //插件版本
    <executions>
        <execution>
            <id>fe.piao_tts</id> //这个是自定义的，一般可以为fe.[你的工程名称]
            <phase>package</phase>
            <goals>
                <goal>FEVersionGenerator</goal>
            </goals>
            <configuration>
                <verPath>${project.basedir}/target/ticket-tts/WEB-INF/template/</verPath> //前端版本号资源存放目录，插件会根据fetag参数自动拉取
                <domain>q.qunarzz.com</domain> //指定前端工程对应的域名，和vm里实际引入的前端资源域名是匹配的
                <verType>VER_FILE</verType> //版本号资源类型：VER_FILE | VER_MAP,一般VER_FILE即可
                <vmPath>${project.basedir}/target/ticket-tts/WEB-INF/template/</vmPath> //前端模版文件目录
                <extension>.vm;.jsp</extension> //在模版文件目录，指定要替换模版类型
                <project>piao_tts</project> //前端工程名称
                <fetag>${fe.piao_tts.version}</fetag> //前端工程对应的发布tag，该参数一般由发布系统传进来。
                <mailto>xinju.dan@qunar.com</mailto> //报警邮件列表，如果发现有匹配不到版本号的情况，会邮件报警
            </configuration>
        </execution>
    </executions>
</plugin>
```

如果一个后端工程关联了多个前端工程，只需要在excutions节点里增加一个excution配置即可。

<b style="color: red">问：非java工程可以使用吗？</b>

答：可以，只要是通过maven构建的工程都可以使用。非maven构建的工程可以通过命令行调用，考虑到需求极少，有需要单独联系xinju.dan。

<b style="color: red">问：关联失败怎么办？</b>

答：如果模版里的前端资源版本号关联失败，可以参考：[http://wiki.corp.qunar.com/pages/viewpage.action?pageId=99772097]

<h2 style="font-weight: normal; font-style: italic;"> 扩展功能 </h2>

<h3 style="font-weight: normal"> 关联报警 </h3>

有时候，前端导出的资源移除了，而后端没有排查完全，或者是分支发布错等原因都会导致 页面关联不到版本号，一旦到线上，页面就会坏掉。

而用自动化插件，配置下mailto节点，在发布阶段，就可以自动把这种情况报警给指定人员，并在邮件里详细描述关联失败的情况，第一时间就可以知道并解决问题。

<h3 style="font-weight: normal"> 预先缓存 </h3>

如果我们在模版（vm/jsp）页面里指定了：

```html
<!--[precache]-->
```

那么发布完成之后，插件就会在工程的resource目录里生成cache-list文件，这样前端拿到这个文件可以选择性的去做预先加载。格式如下：

```javascript
x_precache_callback([
"//q.qunarzz.com/piao_tts/prd/styles/usage/touch/core/style@47045973dd6e2d41c75aea17bbaf8d2d.css",
"//q.qunarzz.com/piao_tts/prd/scripts/cpanel/touch/setting/page@f6ee723939b02c382ba22725b3cd453a.js",
"//q.qunarzz.com/piao_tts/prd/scripts/cpanel/touch/order/consume/page@2e2dd4fc3939ed622aad02e56b7bbd22.js",
"//q.qunarzz.com/piao_tts/prd/styles/usage/touch/page/login/style@1c7164301c45726f7f7cedafaae41b6e.css",
"//q.qunarzz.com/piao_tts/prd/styles/usage/touch/page/list/style@4029ea60c4ab5081deb884aecaa61e32.css",
"//q.qunarzz.com/piao_tts/prd/styles/usage/touch/page/notice/style@c158e2066837e25cc428addf0c00d949.css",
"//q.qunarzz.com/piao_tts/prd/scripts/cpanel/touch/login/page@f7e04d6baba46cced50858f7fafd8818.js",
"//q.qunarzz.com/piao_tts/prd/styles/usage/touch/page/setting/style@71a8fbcdae43dd1c0f74111f88c522ea.css",
"//q.qunarzz.com/piao_base/prd/scripts/release/hybrid@fad1d22cebfdcce55ae669b99a5ad23f.js",
"//q.qunarzz.com/piao_tts/prd/scripts/cpanel/touch/notice/list/page@f26fd1c6ae4e6f997be0bf391d85762c.js",
"//q.qunarzz.com/piao_tts/prd/scripts/cpanel/touch/order/list/page@97ad1e7089b7dbd115fa3b4ae578482c.js"
]);
```

前端可以使用jsonp的方式去选择性的预先加载这些文件，或者发挥想象力做一些其他优化。

<h3 style="font-weight: normal"> HTML压缩 </h3>

前端工程发布后，js、css这些都得到了压缩，对于加载速度流量要求较高的页面，HTML也需要压缩怎么办呢？拿门票首页面来说，启用HTML压缩之前大小是130k+，压缩之后能到80k+，还是比较可观的。

使用fekit-maven-plugin可以做到，发布过程中对jsp进行可选择性压缩。

*使用方法：*

在jsp页面任意位置增加如下标记，当然建议增加在头部。

```html
<!--[minsource on]-->
```

如果是一个jsp里include多个小jsp，需要在小jsp里也加入此标记。

<h2 style="font-weight: normal"> 开放源码 </h2>

[http://gitlab.corp.qunar.com/ticket/fekit-maven-plugin] 这个是工程源码地址，欢迎大家一起参与修正。

<h2 style="font-weight: normal"> To Do List </h2>

热更新：前端发布后，不需要发布后端，不需要重启后端应用，通过一个指令即可完成前端版本号同步到后台模版。

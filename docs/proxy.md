<h1 style="font-weight: normal"> 代理工具 </h1>

<h2 style="font-weight: normal"> 启动代理 </h2>

Ykit 使用 [Jerry Proxy][1] 作为代理插件。它结合了`SwitchHost`和`Charles/Fiddler`的功能，包括：

- 无 DNS 缓存的 Host 分组管理
- 请求 / 响应日志（抓包）
- 断点
- URL MAP
- 接口 Mock 服务
- 网速控制(Throttling)

并且支持 Qunar 通用域名的 HTTPS。通过下面命令启动代理：

```
$ sudo ykit server -x
```

<h2 style="font-weight: normal"> 切换到代理服务 </h2>

注意此时代理还未生效，我们还需要把请求打到我们的本地代理上。简单的方式是使用`SwitchyOmega`等chrome代理插件，或者使用Proxy右上角推荐的代理插件。以下是`SwitchyOmega`的配置，我们将所有外部请求打到`127.0.0.1:999`，也就是我们的本地代理上。

![屏幕快照 2016-09-08 上午11.43.18](http://gitlab.corp.qunar.com/uploads/mfe/ykit/370cfe24b5/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.43.18.png)

** 注意: 你需要把所有忽略的规则全部清空。另外, ShadowSocks和所有的代理都冲突, 在使用时也需要关闭。 **

<h2 style="font-weight:normal"> Host管理 </h2>

访问http://127.0.0.1:1000/qproxy#/?_k=1kpa78
左侧导航是项目(方案)列表，右侧面板是该分组下 Host 规则。

** 对于Ykit项目，会在项目内新建/读取`ykit.host`，并且同步更新。也就是说你不需要手动创建一个新的方案。 **

![屏幕快照 2016-09-08 上午11.40.30](http://gitlab.corp.qunar.com/uploads/mfe/ykit/392730b24f/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.40.30.png)

点击`添加规则`可以批量导入Host规则, 格式和Host文件完全相同, 除了不支持注释以外:

![Host导入](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/147927077876.png)

在Host导入以后, 配置会立即生效, 无需重启浏览器。点击`导出Host`可以将当前的Host配置转换成Host文件的格式。

另外, Jerry还提供了快速切换环境的功能, 每条Host的右侧有可选择的环境和机器IP, 你可以通过选择它们来快速切换环境。

![切换Env](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/147927237041.png)

我们内置了一些常用的环境如qzz和local, 如果选择online等于没有配置host, 选择custom可以手动输入IP。

如果你需要修改默认的环境/机器组配置, 可以在服务器组配置面板中手动编辑, 如图:

![Edit Server Group](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/147927217132.png)

修改完成后, 你需要重新启动代理才能生效。

<h2 style="font-weight: normal"> Mock服务 </h2>

所有ykit项目都可以开启mock服务, 首先你需要在项目的根路径下添加一个mock.js, 内容如下:

```
module.exports = [
    {
        // 当前环境
        current: 'local',
        // 匹配规则
        pattern: /test\.qunar\.com\/([^?]*)(\?.*)?/,
        // 所有的responder, 生效的是等于current的那个
        responders: {
            "beta": 'http://$1.qunar.com',
            "dev": 'http://$1.qunarman.com',
            "local": './mock/$1.json'
        },
        // 配置jsonp wrapper函数名
        jsonpCallback: 'jsCallback',
        // 响应头的content-type
        contentType: 'text/html'
    },
    {
        // 简易配置, 匹配规则
        pattern: /test2\.qunar\.com\/(.*)/,
        // 返回一个json格式数据, 而不是一个路径
        responder: {id: 2222},
        // 同样可以配这个和contentType
        jsonpCallback: 'jsCallback'
    },
    {
        pattern: /test3\.qunar\.com/,
        responder: {id: '1212dl;akds;l'}
    }
];
```

然后在代理面板中找到你的项目, 然后在右侧开启Mock服务开关即可生效。

![Mock](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/14792706369.png)

<h2 style="font-weight: normal"> 自定义 Url Map </h2>

切换到Url Map选项卡，可以设置请求的远程/本地映射，支持正则匹配。

![屏幕快照 2016-09-08 上午11.53.39](http://gitlab.corp.qunar.com/uploads/mfe/ykit/c1f92f0479/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.53.39.png)

<h2 style="font-weight: normal"> 查看请求日志/设置断点 </h2>

切换到请求/响应日志选项卡，可以查看通过代理请求的接口详细信息，在进行移动端调试时十分便捷。

![屏幕快照 2016-09-08 上午11.55.40](http://gitlab.corp.qunar.com/uploads/mfe/ykit/68d3467c6c/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7_2016-09-08_%E4%B8%8A%E5%8D%8811.55.40.png)

点击日志详情右上角的设置断点可以中断请求, 设置断点之后的效果:

![Block](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/14792715856.png)

点击Continue/Abort就可以让响应继续返回或者abort掉, 这在模拟接口超时或失败时很有用, 另外你还可以在Response选项卡中编辑响应的内容, 如下:

![Block Edit Response](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/147927172206.png)

修改内容之后, 让响应Continue即可生效。在不需要中断时, 可以在断点配置面板中将断点关闭或者删除。

<h2 style="font-weight:normal"> HTTPS和Throttling </h2>

如果你在做HTTPS的开发但是仅仅需要使用host功能,HTTPS代理不必开启。这时候代理服务器会接收浏览器的隧道请求,host配置依然可以生效。

需要在HTTPS下使用URL MAP/抓包等功能的时候,需要开启HTTPS代理,但是需要安装根证书JerryProxyCA.cer, 下载地址:
https://github.com/Ellery0924/Jerry/blob/master/JerryProxyCA.cer

你需要手动信任这个证书, 整个流程和12306的证书安装流程一样。

另外还需要在并在网络配置面板中设置`开启HTTPS代理`, 如下:

![开启https](http://cfyyq.img48.wal8.com/img48/561720_20161116122834/147927120123.png)

另外JerryProxy还提供了常用的网速限流功能, 可以再网络配置中将它打开, 选择No Throttling之后会取消限速。

<h2 style="font-weight: normal"> 注意事项 </h2>

- 需要抓取移动设备的请求时，请保证移动设备和电脑在同一个无线网络下，然后修改移动设备的代理配置，让IP指向自己的电脑，端口为`999`

如有其它问题请联系 `jiao.shen@qunar.com`

[1]: https://github.com/Ellery0924/QProxy

# Ykit

- - -

Ykit是一套可配置和可扩展的前端开发工具集，核心功能包括资源打包、静态资源服务、代码质量检测。Ykit基于打包工具[webpack][1]，支持CommonJs, AMD, ES6 modules, Coffeescript, CSS, SASS, LESS等模块类型的打包。

## 安装(需要在内网环境下)

```bash
$ sudo npm install @qnpm/ykit -g --registry http://registry.npm.corp.qunar.com/
```

## 使用

### 初始化一个项目

```bash
$ mkdir AwesomeProject && cd AwesomeProject && ykit init
```

init时需选择一个初始化config，接着会创建一个对应的配置文件。如选择了qunar配置，则在根目录下会生成ykit.qunar.js，作为该项目的配置文件：

```javascript
exports.config = function() {
    // 定义资源入口
    this.setExports([
        './scripts/index.js',
        './styles/index.scss',
    ]);

    // 自定义命令
    this.setCommands([
        {
            name: 'test-ykit_cmd',
            module: {
                usage: '项目自定义命令',
                run: function () {}
            }
        }
    ])

    // 同步开发机配置
    this.setSync({
        host : "192.168.237.71",
        path: "/home/q/www/qunarzz.com/test-ykit"
    })
};
```

### 启动静态服务

```bash
$ (sudo) ykit server
```

请求`prd/`下资源时会自动进行编译打包。

### 启动静态服务并使用代理

```bash
$ (sudo) ykit server -x
```

### 开发环境打包

```bash
$ ykit pack
```

打包后的资源会放入`dev/`目录。

### 生产环境打包

```bash
$ ykit pack -m
```

打包压缩后的资源会放入`prd/`目录。资源会生成版本号，并放入`ver/`目录。

### 代码同步开发机

```bash
$ ykit sync
```

默认会将`dev/`目录下资源上传到开发机。

### 代码质量检测

```bash
$ ykit lint
```
分别使用eslint/stylelint进行javascript/css代码检测，检测规则依赖于当前配置环境。

### 更多
在特定环境下，会有更多不同类型命令，如安装了ykit-hy-config后，会有yo, kami等构建工具命令。查看所有命令：

```bash
$ ykit
```

查看某个命令的参数:

```bash
$ ykit xxx -h
```


## API
### Node.js API

```javascript
let ykit = require("ykit");

ykit.pack({
    // 配置
}, (err, stats) => {

});
```

### 与Gulp结合使用

```javascript
let ykit = require("ykit");

gulp.task('pack', () => {
    return gulp.src('./')
        .pipe(ykit({
            // 配置
        }));
});
```

### 与Grunt结合使用

```javascript
grunt.initConfig({
    ykit: {
        // 配置
    }
});

grunt.loadNpmTasks('ykit');
```

## 和webpack相比有和不同？
webpack配置项很多，并且有些容易让人困惑。相比于用webpack复杂的配置，Ykit更简单，以下是一些对比：

| Webpack 问题 | Ykit 解决方案 |  
| ------------ | ------------- |
| 有些配置项只在开发环境生效，有些只在生产环境生效，根据环境不同至少要维护两个webpack.config | 通过命令行参数实现功能，隐藏底层配置细节，不再需要维护多个配置文件
| 入口只能为Javascript，如果想要引CSS只能把引用写在Javascript里 | 封装了入口配置，支持CSS/SCSS/LESS/...作为入口 |
| 每添加一个loader/plugin都要查文档如何使用 | 通过定制不同场景，已经内置好loader/plugin，不需要手动添加和配置 |
| 需要满足当前Qunar开发/发布机制，如上传开发机，生成版本号等 | 安装ykit-config-qunar，则这些功能都已内置 |

  [1]: https://github.com/webpack/webpack

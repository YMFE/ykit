# Ykit

- - -

Ykit是一套可配置和可扩展的前端开发工具集，核心功能包括资源打包、静态资源服务、代码质量检测。Ykit基于打包工具[webpack][1]，支持CommonJs, AMD, ES6 modules, Coffeescript, CSS, SASS, LESS等模块类型的打包。

webpack配置项很多，并且有些容易让人困惑。相比于用webpack复杂的配置，Ykit更简单，以下是一些对比：

| Webpack 问题 | Ykit 解决方案 |  
|--------|-------|
| 有些配置项只在开发环境生效，有些只在生产环境生效，根据环境不同至少要维护两个webpack.config | 通过命令行参数实现功能，隐藏底层配置细节，不再需要维护多个配置文件
| 入口只能为Javascript，如果想要引CSS只能把引用写在Javascript里 | 封装了入口配置，支持CSS/SCSS/LESS/...作为入口 |
| 每添加一个loader/plugin都要查文档如何使用 | 通过定制不同场景，已经内置好loader/plugin，不需要手动添加和配置 |
| 需要满足当前Qunar开发/发布机制，如上传开发机，生成版本号等 | 安装ykit-config-qunar，则这些功能都已内置 |

## 安装

```bash
$ (sudo) npm install ykit -g
```

**通常我们还要安装ykit在Qunar环境下配置以满足我们联调发布等需求。**进入你的项目，然后运行：

```bash
$ npm install ykit-config-qunar --save
```

## 使用
在项目内添加适用于当前环境的config。比如在qunar环境下，则创建一个ykit.qunar.js，如：

```javascript
exports.config = function() {
    // 定义资源入口
    this.setExports([
        './scripts/index.js',
        './styles/index.scss',
    ]);
    
    // 自定义命令
    this.commands.push({
        name: 'project_cmd',
        module: {
            usage: '项目自定义的命令',
            run: function () {}
        }
    });
    
    // 同步开发机配置
    this.setConfig({
        syncConfig : {
            "user": "yuhao.ju",
            "host" : "192.168.237.71",
            "path": "/home/q/www/qunarzz.com/ykit-demo/"
        }
    })
};
```

### 启动静态服务

```bash
$ (sudo) ykit server
```

请求`prd/`下资源时会自动进行编译打包。

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

<br /> 
**更多命令会在特定环境下添加，如安装了ykit-hy-config后，会有yo, kami等构建工具命令。**

## API

### Node.js API

```javascript
let ykit = require("ykit");

ykit.pack({
    // 配置
}, (err, stats) => {

});
```

## 与Gulp结合使用

```javascript
let ykit = require("ykit");

gulp.task('pack', () => {
    return gulp.src('./')
        .pipe(ykit({
            // 配置
        }));
});
```

## 与Grunt结合使用

```javascript
grunt.initConfig({
    ykit: {
        // 配置
    }
});

grunt.loadNpmTasks('ykit');
```

  [1]: https://github.com/webpack/webpack

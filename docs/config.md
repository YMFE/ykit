### ykit.{type}.js 文件示例

```js
exports.config = function() {
    // 项目资源入口
    this.setExports([
        './scripts/index.js',
        './styles/index.css'
    ]);

    // 编译环境配置
    this.setCompiler({
        context: './src'
    });

    // sync到开发机配置
    this.setSync({
        host : "192.168.237.71",
        path: "/home/q/www/qunarzz.com/MyYkitProject"
    });

    // 自定义命令
    this.setCommands([
        {
            name: 'MyYkitProject_cmd',
            module: {
                usage: '项目自定义命令',
                run: function () {}
            }
        }
    ]);
};
```

### API

在配置函数中，我们可以通过调用this上的api对项目进行配置，这些基本的api在项目初始化时就已经包含在配置文件中。

#### setExports

设置资源入口。另外也支持通过`setGroupExports`设置入口分组，如：

```js
// 项目分组入口
this.setGroupExports('common', [
    './scripts/common.js',
    './styles/common.css'
]);
```

#### setCompiler
可通过此方法更改编译配置，各项参数与[Webpack Configuration][1]相同，本质上是更改ykit当前的webapck配置，可在此api中更改编译方式，添加编译插件等等。该方法支持对象和函数两种配置参数。

配置参数为对象：

```js
this.setCompiler({
   context: './src',
   devtool: 'cheap-source-map'
});
```

配置参数为函数（进行更复杂的配置）：

```js
var webpack = require('webpack');
this.setCompiler(function(config) {
    // config是当前webpack的配置

    // 添加插件
    config.plugins.push(new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify("production")
        }
    }));

    // 替换原有loader
    config.module = {
        loaders: config.module.loaders.map(function(loader) {
            if (loader.test.test('.js')) {
                return {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'react', 'stage-0']
                    }
                }
            }
            return loader;
        })
    };

    return config;
});
```

#### setEslintConfig

接受一个对象，配置方法和[eslint配置][2]相同，如：

```js
this.setEslintConfig({
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "rules": {
        "semi": 2
    }
})
```

#### setStylelintConfig

接受一个对象，配置方法和[stylelint配置][3]相同，如：
```js
this.setStylelintConfig({
  "rules": {
      "block-no-empty": null,
      "color-no-invalid-hex": true,
      "comment-empty-line-before": ["always", {
      "ignore": ["stylelint-commands", "between-comments"],
      }],
      "unit-whitelist": ["em", "rem", "%", "s"]
  }
})
```

#### setSync

设置同步开发机的配置，需要设置开发机的ip，以及项目要存储的路径。

**注：Windows下需要预装rsync**。


#### setCommands

设置项目自定义命令，在项目目录下执行`ykit {cmd}`即可运行。


[1]: https://webpack.github.io/docs/configuration.html
[2]: http://eslint.cn/docs/user-guide/configuring
[3]: https://github.com/stylelint/stylelint/blob/master/docs/user-guide/configuration.md

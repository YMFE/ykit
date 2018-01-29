# YKit [![CircleCI](https://circleci.com/gh/YMFE/ykit.svg?style=shield)](https://circleci.com/gh/YMFE/ykit)

YKit is a toolkit encapsulates and manages Webpack configuration for various types of web apps. It provides best practice through plugins and helps you create and customize apps through flexible config options.

## Features

- create project in one command
- support react/vue/ant-design/ts/... config plugins
- hot reloading dev server

## Install

- Latest version: `[sudo] npm install ykit -g`
- Or you can choose the newest version：`[sudo] npm install ykit@next -g`

## Quick Start

1. `mkdir ykit-app && cd ykit-app`
2. `ykit init`
3. `ykit s -p 3000`
4. Check out `http://127.0.0.1:3000/index.html`

After setting up your project, there will be the config file called `ykit.js` in your project root directory：

```javascript
module.exports = {
    plugins: [],
    config: {
        export: ['./scripts/index.js', './styles/index.css'],
        modifyWebpackConfig: function (baseConfig) {
            // edit webpack configs
            return baseConfig;
        }
    },
    hooks: {},
    commands: []
};
```

## Document

Visit [https://ykit.ymfe.org/][1] for more doc.

[1]: https://ykit.ymfe.org/

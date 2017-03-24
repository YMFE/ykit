# Ykit [![CircleCI](https://circleci.com/gh/YMFE/ykit.svg?style=shield)](https://circleci.com/gh/YMFE/ykit)

Ykit is a toolkit to simply set up webpack configs for various apps. It offers reliable encapsulated configuration and helps you manage it by using plugins. Ykit helps you easily set up apps and customize project through flexible config options.

## Quick Start

1. `npm install ykit -g`
2. `mkdir ykit-app && cd ykit-app`
3. `ykit init`
4. `cd .. && ykit server`
5. Check out `localhost/ykit-app/index.html`

After setting up your project, there will be the config file called `ykit.js` in your project root directory：

```javascript
module.exports = {
    plugins: [],
    config: {
        export: ['./scripts/index.js', './styles/index.css'],
        modifyWebpackConfig: function modifyWebpackConfig(baseConfig) {
            // edit webpack configs
            return baseConfig;
        }
    },
    hooks: {},
    commands: []
};
```

## Config Options

- **plugins** - To configure plugins inside of a configuration file, use the plugins key, which contains a list of plugin names. Every plugin encapsulates respective webpack configs.
- **config.exports** - Asset entries.
- **config.modifyWebpackConfig** - Callback function for editing ykit's webpack configs.
- **hooks** - Bundler hooks.
- **commands** - Custom commands to do things you like.

## Document

Visit [http://ued.qunar.com/ykit/][1] for more doc.

[1]: http://ued.qunar.com/ykit/index.html

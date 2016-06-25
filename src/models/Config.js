'use strict';

class Config {
    constructor(cwd) {
        this._config = {
            context: sysPath.join(cwd, 'src'),
            entry: {},
            output: {
                path: "./prd",
    			filename: "[name]"
            },
            module: {
                loaders: []
            },
            plugins: [],
            resolve: {
                root: [],
                extensions: ['', '.js', '.css'],
                alias: {}
            }
        };
        this._entry = this._config.entry;
        this._alias = this._config.resolve.alias;
    }
    getPlugins() {
        return this._config.plugins;
    }
    addPlugins(plugins) {
        this._config.plugins = this._config.plugins.concat(plugins);
        return this;
    }
    removePlugin(pluginClass) {
        this._config.plugins = this._config.plugins.filter((plugin) => !plugin instanceof pluginClass);
        return this;
    }
    getLoaders() {
        return this._config.module.loaders;
    }
    addLoaders(loaders) {
        this._config.module.loaders = this._config.module.loaders.concat(loaders);
        return this;
    }
    removePlugins(loaderClass) {
        this._config.module.loaders = this._config.module.loaders.filter((loader) => !loader instanceof loaderClass);
        return this;
    }
    setExports(files) {
        [].concat(files).forEach((file) => {
            var name = file;
            if (file.indexOf('./') == 0) {
                name = file.substring(2);
            } else if (file[0] == '/') {
                name = file.substring(1);
            }
            this._entry[name] = file;
        });
        return this;
    }
    setOutput(output) {
        _.extend(this._config.output, output);
        return this;
    }
    addRoots(paths) {
        this._config.resolve.root = this._config.resolve.root.concat(paths);
        return this;
    }
    removeRoot(path) {
        let index = this._config.resolve.root.indexOf(path);
        if (index > -1) {
            this._root.splice(i, 1);
        }
        return this;
    }
    addExtensions(exts) {
        this._config.resolve.extensions = this._config.resolve.extensions.concat(exts);
        return this;
    }
    removeExtension(ext) {
        let index = this._config.resolve.extensions.indexOf(ext);
        if (index > -1) {
            this._extensions.splice(i, 1);
        }
        return this;
    }
    setAlias(name, path) {
        this._alias[name] = path;
        return this;
    }
    removeAlias(name) {
        delete this._alias;
    }
    getConfig() {
        return this._config;
    }
};

module.exports = Config;

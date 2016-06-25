var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin")

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');

    optimist.alias('h', 'hash');
    optimist.describe('h', '为bundle文件添加hash');
};

exports.run = function(options) {
	var cmdExecutedPath = process.cwd()

    var plugins = []
    plugins.push(
        new ExtractTextPlugin("styles.css")
    )
    if(options.m){
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        )
    }

	webpack({
		context: cmdExecutedPath,
		entry: "./src/entry.js",
		output: {
			path: "./dist",
			filename: "bundle.js"
		},
		module: {
			loaders: [
                {
                	test: /\.js$/,
                	exclude: /(node_modules|bower_components)/,
                	loader: 'babel',
                	query: {
                		presets: ['es2015']
                	}
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract("style-loader", "css-loader")
                }
            ]
		},
        plugins: plugins,
	}, function(err, stats) {
		if (err) {
			info(err);
			return
		}

		info('pack succeed');
	})
};

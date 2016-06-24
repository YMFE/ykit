var webpack = require('webpack')

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
    optimist.alias('m', 'min');
    optimist.describe('m', '压缩/混淆项目文件');
};

exports.run = function(options) {
	var cmdExecutedPath = process.cwd()

	webpack({
		context: cmdExecutedPath,
		entry: "./src/entry.js",
		output: {
			path: "./dist",
			filename: "bundle.js"
		},
		module: {
			loaders: [{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}]
		},
        plugins: [
            options.m ? new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }) : null
        ],
	}, function(err, stats) {
		if (err) {
			info(err);
			return
		}

		info('pack succeed');
	})
};

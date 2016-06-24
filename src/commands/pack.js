var webpack = require('webpack')

exports.usage = "资源编译、打包";

exports.setOptions = (optimist) => {
	// TODO
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
				loader: 'babel', // 'babel-loader' is also a legal name to reference
				query: {
					presets: ['es2015']
				}
			}]
		}
	}, function(err, stats) {
		if (err) {
			info(err);
			return
		}

		info('pack succeed');
	})
};

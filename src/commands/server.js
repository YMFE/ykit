var webpack = require('webpack')
var WebpackDevServer = require("webpack-dev-server");

exports.usage = "开启本地服务";

exports.setOptions = (optimist) => {
	optimist.alias('h', 'hot');
	optimist.describe('h', '热加载');

    optimist.alias('s', 'https');
	optimist.describe('s', '使用https协议');

    optimist.alias('p', 'port');
	optimist.describe('p', '端口');
};

exports.run = function(options) {
	var cmdExecutedPath = process.cwd()

	var compiler = webpack({
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
		}
	});

    var defaultOptions = {
        h: false,
        s: false,
        p: 8080,
    }
    options = Object.assign(defaultOptions, options);

	var server = new WebpackDevServer(compiler, {
		// webpack-dev-server options

		contentBase: cmdExecutedPath,
		// or: contentBase: "http://localhost/",

		hot: options.h,
		// Enable special support for Hot Module Replacement
		// Page is no longer updated, but a "webpackHotUpdate" message is send to the content
		// Use "webpack/hot/dev-server" as additional module in your entry point
		// Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

		// Set this as true if you want to access dev server from arbitrary url.
		// This is handy if you are using a html5 router.
		historyApiFallback: false,

		// Set this if you want to enable gzip compression for assets
		compress: false,

		// Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
		// Use "*" to proxy all paths to the specified server.
		// This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
		// and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
		// proxy: {
		// 	"*": "http://localhost:9090"
		// },

		// pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
		staticOptions: {},

		// webpack-dev-middleware options
        https: options.s,
		quiet: false,
		noInfo: false,
		lazy: true,
		filename: "bundle.js",
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000
		},
		publicPath: "/",
		headers: {
			"X-Custom-Header": "yes"
		},
		stats: {
			colors: true
		}
	});

    console.log('YKit server running on ' + options.p + '...');
	server.listen(options.p, "localhost", function() {});

	// server.close();
};

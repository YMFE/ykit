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
		}
	}, function(err, stats) {
        if(err){
            info(err);
            return
        }

        info('pack succeed');
	})
};

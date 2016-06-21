exports.usage = "测试命令";

exports.setOptions = (optimist) => {
    optimist.alias('p', 'port');
    optimist.describe('p', '端口');
    optimist.alias('s', 'save');
    optimist.describe('s', '存储');
};

exports.run = function(options) {
    console.log(options);
};

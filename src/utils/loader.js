let fs = require('fs');
let path = require('path');
let yaml = require('js-yaml');


function loadYAML(filePath) {
    try {
        return yaml.safeLoad(fs.readFileSync(filePath, 'utf-8')) || {};
    } catch (error) {
        error.message = `Cannot read config file: ${filePath} \nError: ${error.message}`;
        throw error;
    }
}

function loadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        error.message = `Cannot read config file: ${filePath} \nError: ${error.message}`;
        throw error;
    }
}

function loadJS(filePath) {
    try {
        delete require.cache[filePath];
        return require(filePath);
    } catch (error) {
        error.message = `Cannot read config file: ${filePath} \nError: ${error.message}`;
        throw error;
    }
}

let loader = {
    /**
     * @function load
     * @param {string} filePath 需要读取的文件的完整路径
     * @return {object}
     * @description 该方法接受一个文件路径作为参数，把文件内容解析为 JavaScript 对象后返回
     * 如果文件不存在，返回空对象。
     */
    load: function(filePath){
        let content = null;
        switch (path.extname(filePath)) {
        case '.js':
            content = loadJS(filePath);
            break;
        case '.json':
            content = loadJSON(filePath);
            break;
        case '.yml':
        case '.yaml':
            content = loadYAML(filePath);
            break;
        default:
            break;
        }
        return content;

    },
    /**
     * @function loadFirstExist
     * @param {array} filePathArray 尝试读取的文件列表
     * @return {object}
     * @description 尝试对一组文件进行读取，找到第一个存在的文件，并返回解析得到的
     * JavaScript 对象，如果所有文件都不存在，返回空对象。
     *
     */
    loadFirstExist: function(filePathArray){
        for(let i = 0; i< filePathArray.length; i++){
            let filePath = filePathArray[i];
            if( fs.existsSync(filePath) ){
                return loader.load(filePath);
            }
        }
        return null;
    }
};



module.exports = loader;

const path = require('path');
const expect = require('chai').expect;

const UtilFs = require('../../src/utils/fs.js');


describe('readJSON', function(){
    let filePath = path.resolve(__dirname, './source/file.json');
    let content = require('./source/file.json');

    it('应该能够正确读取并解析为 JavaScript 对象', function(){
        expect(UtilFs.readJSON(filePath)).to.deep.equal(content);
    });
});

describe('readYAML', function(){
    let filePath = path.resolve(__dirname, './source/file.yaml');

    it('应该能够正确读取并解析为 JavaScript 对象', function(){
        expect(UtilFs.readYAML(filePath)).to.be.an('object');
    });
});

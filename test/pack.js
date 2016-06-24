require('shelljs/global')

var assert = require('chai').assert;

describe('pack command', function() {
	describe('commonjs', function() {
		it('command code should return 0', function() {
			this.timeout(5000);

			cd('./examples/pack-commonjs/')

			var result = exec('node ../../bin/ykit pack', {silent:true});
			assert.equal(result.code, 0);
		});
	});

	describe('amd', function() {
		it('command code should return 0', function() {
			this.timeout(5000);

			cd('./examples/pack-amd/')

			var result = exec('node ../../bin/ykit pack', {silent:true});
			assert.equal(result.code, 0);
		});
	});
});

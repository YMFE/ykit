require('shelljs/global')

var assert = require('chai').assert;

describe('command', function() {
	describe('pack', function() {
		it('pack command should return 0', function() {
			this.timeout(5000);

			cd('./examples/pack/')

			var result = exec('node ../../bin/ykit pack', {silent:true});
			assert.equal(result.code, 0);
		});
	});
});

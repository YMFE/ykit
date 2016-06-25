require('shelljs/global')

var assert = require('chai').assert;

describe('pack command', function() {
	this.timeout(8000);

	afterEach(function() {
		cd('../../')
	})

	describe('commonjs', function() {
		it('command code should return 0', function() {
			cd('./examples/pack-commonjs')

			var result = exec('node ../../bin/ykit pack', {
				silent: true
			});
			assert.equal(result.code, 0);
		});
	});

	describe('amd', function() {
		it('command code should return 0', function() {
			cd('./examples/pack-amd')

			var result = exec('node ../../bin/ykit pack', {
				silent: true
			});
			assert.equal(result.code, 0);
		});
	});

	describe('es6', function() {
		it('command code should return 0', function() {
			cd('./examples/pack-es6')

			var result = exec('node ../../bin/ykit pack', {
				silent: true
			});
			assert.equal(result.code, 0);
		});
	});

	describe('min', function() {
		it('command code should return 0', function() {
			cd('./examples/pack-min')

			var result = exec('node ../../bin/ykit pack -m', {
				silent: true
			});
			assert.equal(result.code, 0);
		});
	});

	describe('css', function() {
		it('command code should return 0', function() {
			cd('./examples/pack-css')

			var result = exec('node ../../bin/ykit pack -h', {
				silent: true
			});
			assert.equal(result.code, 0);
		});
	});
});

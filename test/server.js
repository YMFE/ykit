require('shelljs/global')
var pm2 = require('pm2');

var assert = require('chai').assert;

describe('server command', function() {
	this.timeout(8000);

	afterEach(function() {
		cd('../../')
	})

    // TODO use pm2 test server
});

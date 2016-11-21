'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chalk = require('chalk');
var extend = require('extend');
var cliCursor = require('cli-cursor');
var cliSpinners = require('cli-spinners');
var logSymbols = require('log-symbols');

var Ora = function () {
    function Ora(options) {
        _classCallCheck(this, Ora);

        if (typeof options === 'string') {
            options = {
                text: options
            };
        }

        this.options = extend(true, {
            text: '',
            color: 'cyan',
            stream: process.stderr
        }, options);

        var sp = this.options.spinner;
        this.spinner = (typeof sp === 'undefined' ? 'undefined' : _typeof(sp)) === 'object' ? sp : process.platform === 'win32' ? cliSpinners.line : cliSpinners[sp] || cliSpinners.dots; // eslint-disable-line no-nested-ternary

        if (this.spinner.frames === undefined) {
            throw new Error('Spinner must define `frames`');
        }

        this.text = this.options.text;
        this.color = this.options.color;
        this.interval = this.options.interval || this.spinner.interval || 100;
        this.stream = this.options.stream;
        this.id = null;
        this.frameIndex = 0;
        this.enabled = this.options.enabled || this.stream && this.stream.isTTY && !process.env.CI;
    }

    _createClass(Ora, [{
        key: 'frame',
        value: function frame() {
            var frames = this.spinner.frames;
            var frame = frames[this.frameIndex];

            if (this.color) {
                frame = chalk[this.color](frame);
            }

            this.frameIndex = ++this.frameIndex % frames.length;

            return frame + ' ' + this.text;
        }
    }, {
        key: 'clear',
        value: function clear() {
            if (!this.enabled) {
                return this;
            }

            this.stream.clearLine();
            this.stream.cursorTo(0);

            return this;
        }
    }, {
        key: 'render',
        value: function render() {
            this.clear();
            this.stream.write(this.frame());

            return this;
        }
    }, {
        key: 'start',
        value: function start() {
            if (!this.enabled || this.id) {
                return this;
            }

            cliCursor.hide();
            this.render();
            this.id = setInterval(this.render.bind(this), this.interval);

            return this;
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (!this.enabled) {
                return this;
            }

            clearInterval(this.id);
            this.id = null;
            this.frameIndex = 0;
            this.clear();
            cliCursor.show();

            return this;
        }
    }, {
        key: 'succeed',
        value: function succeed() {
            return this.stopAndPersist(logSymbols.success);
        }
    }, {
        key: 'fail',
        value: function fail() {
            return this.stopAndPersist(logSymbols.error);
        }
    }, {
        key: 'stopAndPersist',
        value: function stopAndPersist(symbol) {
            this.stop();
            this.stream.write((symbol || ' ') + ' ' + this.text + '\n');

            return this;
        }
    }]);

    return Ora;
}();

module.exports = function (opts) {
    return new Ora(opts);
};
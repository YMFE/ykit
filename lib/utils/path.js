'use strict';

exports.normalize = function (str, stripTrailing) {
    if (typeof str !== 'string') {
        throw new TypeError('expected a string');
    }
    str = str.replace(/[\\\/]+/g, '/');
    if (stripTrailing !== false) {
        str = str.replace(/\/$/, '');
    }
    return str;
};
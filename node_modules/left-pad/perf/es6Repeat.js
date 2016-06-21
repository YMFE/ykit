'use strict';

module.exports = function (str, len, ch) {
  // convert `str` to `string`
  str = str + '';

  // doesn't need to pad
  len = len - str.length;
  if (len <= 0) return str;

  // convert `ch` to `string`
  if (!ch && ch !== 0) ch = ' ';
  ch = ch + '';

  if (len > 0) {
    return ch.repeat(len) + str;
  }

  return str;
};

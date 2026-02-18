const path = require('path');

const baseDir = __dirname;

exports.init = function() {
  console.log('Initializing from', baseDir);
};

exports.resolve = function(name) {
  return require.resolve(name);
};

exports.loadModule = function(modulePath) {
  return require(modulePath);
};

module.exports.getPath = function() {
  return __filename;
};

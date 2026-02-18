const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const config = require('./config.json');

const currentDir = __dirname;
const currentFile = __filename;

const resolved = require.resolve('./utils');

function loadPlugin(name) {
  const plugin = require(name);
  return plugin;
}

const data = require('./data.json');

module.exports = {
  start: function() {
    console.log('Starting from', currentDir);
    utils.init();
  },
  getConfig: function() {
    return config;
  }
};

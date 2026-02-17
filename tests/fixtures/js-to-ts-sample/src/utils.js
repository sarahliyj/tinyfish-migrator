const lodash = require('lodash');

/**
 * @type {Object}
 */
const config = {
  apiUrl: 'http://localhost:3000',
  timeout: 5000,
};

/**
 * @param {string} name
 * @param {number} age
 */
function createUser(name, age) {
  return { name, age, id: Math.random() };
}

function processItems(items) {
  return items.map(item => item.value * 2);
}

module.exports = { config, createUser, processItems };

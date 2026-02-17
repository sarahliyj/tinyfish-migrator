const React = require('react');
const ReactDOM = require('react-dom');
const App = require('./App');
require('./styles/main.css');

const apiUrl = process.env.API_URL;

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    ReactDOM.render(<NextApp />, document.getElementById('root'));
  });
}

const components = require.context('./components', true, /\.jsx$/);
components.keys().forEach(key => {
  console.log('Loading component:', key);
});

module.exports = { App };

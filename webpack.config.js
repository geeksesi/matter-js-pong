const path = require('path');

module.exports = {
  entry: './game.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  watch: true,
  watchOptions: {
    poll: 1000 // Check for changes every second
  }
};
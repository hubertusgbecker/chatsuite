const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // Ensure proper Node.js target
  config.target = 'node';

  // Override externals to include reflect-metadata in the bundle
  config.externals = [
    ({ request }, callback) => {
      // Always bundle reflect-metadata
      if (request === 'reflect-metadata') {
        return callback();
      }

      // Bundle tslib as well for proper decorator support
      if (request === 'tslib') {
        return callback();
      }

      // Externalize other node_modules
      if (/^[a-z@][\w\-\.]*(\/[\w\-\.]*)*$/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }

      // Include everything else in the bundle
      callback();
    }
  ];

  return config;
});

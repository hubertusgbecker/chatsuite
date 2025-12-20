const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  (config, { options, context }) => {
    // Ensure the dev server accepts requests with arbitrary Host headers
    // (Docker healthchecks use the container name as Host which can be blocked
    //  by webpack-dev-server's host check and return HTTP 403). Setting
    //  allowedHosts to 'all' and host to 0.0.0.0 avoids that issue inside
    //  containerized environments such as Synology Docker.
    if (!config) config = {};
    config.devServer = config.devServer || {};
    // Allow all hosts (safe for local/dev only) so healthchecks using the
    // container hostname don't get 403 Forbidden.
    config.devServer.allowedHosts = 'all';
    // Expose server on all network interfaces inside container
    config.devServer.host = '0.0.0.0';
    return config;
  }
);

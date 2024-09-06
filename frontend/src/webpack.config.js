// webpack.config.js
module.exports = {
    // ... other configuration settings
    resolve: {
      fallback: {
        "crypto": require.resolve("crypto-browserify")
      }
    }
  };
  
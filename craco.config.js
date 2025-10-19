const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  style: {
    sass: {
      loaderOptions: {
        sassOptions: {
          quietDeps: true,
          silenceDeprecations: [
            'legacy-js-api',
            'import',
            'color-functions',
            'mixed-decls'
          ]
        }
      }
    }
  },
  webpack: {
    plugins: {
      add: process.env.ANALYZE === 'true' ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
          generateStatsFile: true,
          statsFilename: 'bundle-stats.json'
        })
      ] : []
    },
    configure: (webpackConfig) => {
      // Performance budgets
      webpackConfig.performance = {
        hints: 'warning',
        maxEntrypointSize: 819200, // 800KB for main bundle
        maxAssetSize: 512000, // 500KB for individual assets (vendor chunks)
      };

      // Ensure source maps are disabled for lighthouse builds
      if (process.env.REACT_APP_API_BASE === 'http://localhost:3300') {
        webpackConfig.devtool = false;
      }

      return webpackConfig;
    }
  }
}; 
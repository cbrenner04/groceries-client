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
        maxAssetSize: 819200, // 800KB for individual assets (vendor chunks)
      };

      return webpackConfig;
    }
  }
}; 
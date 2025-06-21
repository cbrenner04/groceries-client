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
  }
}; 
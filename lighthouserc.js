module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build:lighthouse && npx serve -l 3000 build',
      startServerReadyPattern: 'Accepting connections',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.95 }],
        // Specific performance metrics
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'max-potential-fid': ['warn', { maxNumericValue: 250 }],
        // Resource size budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 716800 }], // 700KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 1024000 }], // 1MB
        // Allow some unused code from libraries
        'unused-css-rules': ['warn', { maxLength: 2 }],
        'unused-javascript': ['warn', { maxLength: 2 }],
        'legacy-javascript': ['warn', { maxLength: 1 }],
        // bf-cache is difficult with React, effectively ignore
        'bf-cache': 'off',
        // Allow failed network requests during testing (no backend running)
        'errors-in-console': ['warn', { maxLength: 10 }],
        // Cache headers are deployment/CDN config, not code
        'cache-insight': ['warn', { maxLength: 10 }],
        'uses-long-cache-ttl': ['warn', { maxLength: 10 }],
        // CRA minifies correctly; lighthouse sometimes reports false positives
        'unminified-css': ['warn', { maxLength: 3 }],
        'unminified-javascript': ['warn', { maxLength: 2 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};


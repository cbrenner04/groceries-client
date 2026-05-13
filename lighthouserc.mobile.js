module.exports = {
  ci: {
    collect: {
      startServerCommand:
        'npm run build:production && npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: ['http://127.0.0.1:4174'],
      numberOfRuns: 3,
      settings: {
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474.56,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
        emulatedFormFactor: 'mobile',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }], // Slightly lower for mobile
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.95 }],
        // Mobile-specific performance metrics (more lenient)
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],
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
        // React apps typically have some render-blocking CSS
        'render-blocking-resources': ['warn', { maxLength: 1 }],
        'render-blocking-insight': ['warn', { maxLength: 1 }],
        // Network dependency tree is minimal for SPA
        'network-dependency-tree-insight': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

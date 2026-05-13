module.exports = {
  ci: {
    collect: {
      startServerCommand:
        'npm run build:production && npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
      startServerReadyPattern: 'Accepting connections',
      startServerReadyTimeout: 30000,
      url: ['http://127.0.0.1:4174'],
      numberOfRuns: 3,
      settings: {
        preset: 'mobile',
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
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};

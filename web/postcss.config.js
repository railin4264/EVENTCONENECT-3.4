module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-import': {},
    'postcss-nesting': {},
    'postcss-custom-properties': {
      preserve: false,
    },
    'postcss-custom-media': {},
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false,
        'custom-media-queries': false,
        'nesting-rules': false,
      },
    },
    'cssnano': {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: false,
          colormin: true,
          minifyFontValues: true,
          minifySelectors: true,
          mergeLonghand: true,
          mergeRules: true,
          minifyGradients: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: true,
          orderedValues: true,
          reduceIdents: true,
          reduceInitial: true,
          reduceTransforms: true,
          uniqueSelectors: true,
          zindex: false,
        },
      ],
    },
    'postcss-reporter': {
      clearReportedMessages: true,
      throwError: false,
    },
  },
};

module.exports = function babelConfig(api) {
  const isProd = api.cache(() => process.env.NODE_ENV === 'production');
  const babelEnv = api.cache(() => process.env.BABEL_ENV);

  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from',
  ];

  if (isProd) {
    plugins.push(
      'transform-react-remove-prop-types'
    );
  }
  return {
    presets: [
      ['@babel/preset-env', {
        loose: true,
        modules: babelEnv === 'es' ? false : 'commonjs',

      }],
      '@babel/preset-react',
    ],
    plugins,
  };
};

const { BABEL_ENV } = process.env;
const building = BABEL_ENV !== undefined && BABEL_ENV !== 'cjs';

const plugins = [];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    'transform-react-remove-prop-types'
  );
}

module.exports = {
  presets: [
    ['es2015', {
      loose: true,
      modules: building ? false : 'commonjs',
    }],
    'stage-0',
    'react',
  ],
  plugins,
};

const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const builtins = require('builtin-modules');

const entrypoint = 'lambda';
const outputDir = 'build';

const bundleConfig = {
  input: [`src/${entrypoint}/index.ts`, `src/${entrypoint}/lib/rss.ts`],
  plugins: [
    json(),
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript(),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
  external: [...builtins, 'aws-sdk'],
}

const outputConfig = { dir: `${outputDir}/${entrypoint}`, format: 'cjs' };

module.exports = {
  bundleConfig,
  outputConfig,
};

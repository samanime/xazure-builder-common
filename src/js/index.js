import { join, dirname, basename } from 'path';
import { transform } from 'babel-core';
import logger from 'xazure-logger';
import { mkdirp, writeFile, readFile } from '../utils';

const privateBabelConfig = {
  babelrc: false,
  presets: ['env'],
  plugins: ['transform-object-rest-spread'],
  sourceMaps: true
};

const publicBabelConfig = {
  babelrc: false,
  presets: [['env', { modules: false }]],
  plugins: [
    'transform-object-rest-spread',
    ['import-rename', {"^(\\.+)\/((.(?!\\.[a-z]+))*)$": "$1/$2.js"}]
  ],
  sourceMaps: true
};

const mergeBabel = (arr, add, remove) => {
  return [].concat(arr)
    .filter(a => !(remove.includes([].concat(a)[0]) || add.find(a2 => [].concat(a2)[0] === [].concat(a)[0])))
    .concat(add);
};

const buildBabelConfig = (base, { plugins = [], presets = [], disablePlugins = [], disablePresets = [] } = {}) =>
  Object.assign(base, {
    presets: mergeBabel(base.presets, presets, disablePresets),
    plugins: mergeBabel(base.plugins, plugins, disablePlugins)
  });

const buildJsFile = async (sourceFilePath, destinationFilePath, config) => {
  const { code, map } = transform(await readFile(sourceFilePath), config);

  logger.debug('Build JS File', sourceFilePath, destinationFilePath, config);
  await mkdirp(dirname(destinationFilePath));
  return Promise.all([
    writeFile(join(destinationFilePath), code + `\n//# sourceMappingURL=${basename(destinationFilePath)}.map`),
    writeFile(join(`${destinationFilePath}.map`), map)
  ]);
};

const createJsBuilder = (rootDir, sourceDir, destinationDir, defaultConfig, baseConfig) => {
  const config = buildBabelConfig(defaultConfig, baseConfig);

  return filePath => buildJsFile(join(rootDir, sourceDir, filePath), join(rootDir, destinationDir, filePath), config);
};

export const createPublicJsBuilder = (sourceDir, destinationDir) =>
  (rootDir, { babel: { public: babelPublic = {} } = {} } = {}) =>
    createJsBuilder(rootDir, sourceDir, destinationDir, publicBabelConfig, babelPublic);

export const createPrivateJsBuilder = (sourceDir, destinationDir) =>
  (rootDir, { babel: { private: babelPrivate = {} } = {} } = {}) =>
    createJsBuilder(rootDir, sourceDir, destinationDir, privateBabelConfig, babelPrivate);
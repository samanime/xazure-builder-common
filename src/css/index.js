import { join } from "path";
import logger from 'xazure-logger';
import { writeFile, mkdirp, readFile } from '../utils';
import postCssBase from 'postcss';
import postCssNext from 'postcss-cssnext';
import postCssImport from 'postcss-import';
import postCssNested from 'postcss-nested';

const postCssDefaultPlugins = {
  cssnext: postCssNext(),
  import: postCssImport(),
  nested: postCssNested()
};

const buildPostCssPlugins = (defaultPlugins, { plugins = [], disable = [] } = {}) => [].concat(
  Object.entries(defaultPlugins).filter(([name, ]) => !disable.includes(name)).map(([, plugin]) => plugin)
).concat(plugins);

const buildPostCss = postCssConfig => postCssBase(buildPostCssPlugins(postCssDefaultPlugins, postCssConfig));

const buildCssFile = async (rootDir, sourceDir, destinationDir, file, postCss) => {
  const { css, map } = await postCss.process(await readFile(join(rootDir, sourceDir, file)),
    { from: join(sourceDir, file), to: join(destinationDir, file) });

  logger.debug('Build CSS File', rootDir, sourceDir, destinationDir, file);
  await mkdirp(join(rootDir, destinationDir));
  await Promise.all([
    writeFile(join(rootDir, destinationDir, file), css + `\n/*# sourceMappingURL=${file.map} */`),
    writeFile(join(rootDir, destinationDir, `${file}.map`), map)
  ]);
};

export const createCssBuilder = (sourceDir, destinationDir) => (rootDir, { postCss: postCssConfig = {} } = {}) => {
  const postCss = buildPostCss(postCssConfig);

  return filePath => buildCssFile(rootDir, sourceDir, destinationDir, filePath, postCss);
};
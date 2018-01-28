import { createReadStream, createWriteStream } from "fs";
import logger from 'xazure-logger';

const copyFile = async (sourceFilePath, destinationFilePath) => new Promise((resolve, reject) => {
  const readStream = createReadStream(sourceFilePath);
  const writeStream = createWriteStream(destinationFilePath);

  logger.debug('Copy File', sourceFilePath, destinationFilePath);
  readStream.once('error', reject);
  writeStream.once('error', reject);
  readStream.once('end', resolve);

  readStream.pipe(writeStream);
});

export const createCopyBuilder = (sourceDir, destinationDir) => rootDir => filePath =>
  copyFile(join(rootDir, sourceDir, filePath), join(rootDir, destinationDir, filePath));
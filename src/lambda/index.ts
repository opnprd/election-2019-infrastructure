import * as s3 from './lib/s3';
import { promises } from 'dns';

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'public/results/';

function buildProcessor(key) {
  return async () => {
    const content = await s3.getObjectContents({ bucket: bucketName, path: key });
    // Reshape and add reference
    await s3.putObjectContents({ bucket: bucketName, path: key }, content);
  }
}

function batcher(acc, current, index) {
  const batch = Math.floor(index/10);
  acc.length = batch + 1;
  if (!Array.isArray(acc[batch])) acc[batch] = [];
  acc[batch] = [ ...acc[batch], current ];
  return acc;
}

export async function enrich(event, context) {
  const resultFiles = await s3.getObjectList({
    bucket: bucketName,
    path: bucketPath,
  })
  const processors = resultFiles.map(buildProcessor).reduce(batcher, []);
  while (processors.length) {
    const batch = processors.shift();
    await Promise.all(batch.map((x: () => void) => x()))
  }
}

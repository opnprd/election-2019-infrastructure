import { basename } from 'path';
import * as s3 from './lib/s3';

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'public/results/';
const outputBucketPath = 'processed/';
const summaryFile = outputBucketPath + '2019-results.csv';

function buildProcessor(key: string) {
  return async () : Promise<[string, string]> => {
    const filename = basename(key);
    const resultSet = await s3.getObjectContents({ bucket: bucketName, path: key }).then(JSON.parse);
    // Reshape and add reference
    const { id, elections: { 2019: { candidates } } = resultSet;
    const winner = candidates.sort((a,b) => b.votes - a.votes)[0].party.code;
    await s3.putObjectContents({ bucket: bucketName, path: outputBucketPath + filename }, JSON.stringify(resultSet), 'public-read');
    return [ id, winner ];
  }
}

function batcher(acc, current: any, index: number) : any[] {
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
  const results = [[ 'ccode', 'first19' ]];
  while (processors.length) {
    const batch = processors.shift();
    const result : string[][] = await Promise.all(batch.map(x => x()))
    results.push(...result);
  }
  const summaryCsv = results.map(x => x.join(',')).join('\n');
  await s3.putObjectContents({ bucket: bucketName, path: summaryFile }, summaryCsv, 'public-read');
}

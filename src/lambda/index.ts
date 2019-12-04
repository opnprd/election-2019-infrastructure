import { basename } from 'path';
import * as s3 from './lib/s3';
import feed, { link } from './lib/rss';

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'public/results/';
const outputBucketPath = 'processed/';
const summaryFile = outputBucketPath + '2019-results.csv';
const atomFeed = outputBucketPath + 'feed.atom';
const rssFeed = outputBucketPath + 'feed.rss';

function buildProcessor(key: string) {
  return async () => {
    const filename = basename(key);
    const resultSet = await s3.getObjectContents({ bucket: bucketName, path: key }).then(JSON.parse);
    // Reshape and add reference
    await s3.putObjectContents({ bucket: bucketName, path: outputBucketPath + filename }, JSON.stringify(resultSet), { acl: 'public-read', contentType: 'application/json' });
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
  const objects = event.Records.map(r => r.s3.object.key );
  const processors = objects.map(buildProcessor).reduce(batcher, []);
  while (processors.length) {
    const batch = processors.shift();
    await Promise.all(batch.map(x => x()))
  }
}

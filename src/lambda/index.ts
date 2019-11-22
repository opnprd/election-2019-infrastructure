import * as s3 from './lib/s3';

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'results/';

export async function enrich(event, context) {
  const resultFiles = await s3.getObjectList({
    bucket: bucketName,
    path: bucketPath,
  })
  console.dir(resultFiles);
}

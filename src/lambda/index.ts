import * as s3 from './lib/s3';

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'public/results/';

export async function enrich(event, context) {
  const resultFiles = await s3.getObjectList({
    bucket: bucketName,
    path: bucketPath,
  })
  // TODO Get this to return a function, which is executed in batches
  const processFile = resultFiles.map(async (key) => {
    const content = await s3.getObjectContents({ bucket: bucketName, path: key });
    console.log(content);
  })
  await Promise.all(processFile);
}

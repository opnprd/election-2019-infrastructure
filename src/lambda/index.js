const { S3 } = require('aws-sdk');

const s3 = new S3();

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'results/';

async function getObjectList({ bucket, prefix }) {
  const objects = [];
  const pageSize = 2;
  // TODO: deal with continuations if > max number.
  // let truncated;
  // do {
    const results = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: pageSize,
    }).promise();
    console.log(results);
    objects.push(...results.Contents.map(x => x.Key));
    // ({ IsTruncated: truncated }) = results;
  // } while(truncated);
  return objects;
}

async function enrich(event, context) {
  const resultFiles = getObjectList({
    Bucket: bucketName,
    Prefix: bucketPath,
  })
  console.dir(resultFiles);
}

module.exports = {
  enrich,
};

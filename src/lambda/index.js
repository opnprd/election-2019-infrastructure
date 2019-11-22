const { S3 } = require('aws-sdk');

const s3 = new S3();

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'results/';

async function getObjectList({ bucket, prefix }) {
  const objects = [];
  const pageSize = 2;

  let truncated;
  let continuationToken;
  do {
    const results = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: pageSize,
      ContinuationToken: continuationToken,
    }).promise();
    objects.push(...results.Contents.map(x => x.Key));
    ({ IsTruncated: truncated, NextContinuationToken: continuationToken } = results);
  } while (truncated);
  return objects;
}

async function enrich(event, context) {
  const resultFiles = await getObjectList({
    bucket: bucketName,
    prefix: bucketPath,
  })
  console.dir(resultFiles);
}

module.exports = {
  enrich,
};

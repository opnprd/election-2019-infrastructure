const { S3 } = require('aws-sdk');

const s3 = new S3();

const bucketName = 'odileeds-uk-election-2019';
const prefix = 'results/';

async function enrich(event, context) {
  // TODO: deal with continuations if > max number.
  const resultFiles = [];
  const pageSize = 10;
  // let truncated;
  // do {
    const results = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: pageSize,
    }).promise();
    resultFiles.push(...results.Contents.map(x => x.Key));
    // ({ IsTruncated: truncated }) = results;
  // } while(truncated);

  console.dir(resultFiles);
}

module.exports = {
  enrich,
};

const { S3 } = require('aws-sdk');

const s3 = new S3();

const bucketName = 'odileeds-uk-election-2019';
const prefix = 'results/';

async function enrich(event, context) {
  // TODO: deal with continuations if > max number.
  const results = await s3.listObjectsV2({
    Bucket: bucketName,
    Prefix: prefix,
  }).promise();
  console.dir(results);
}

module.exports = {
  enrich,
};

const { S3 } = require('aws-sdk');

const s3 = new S3({
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

module.exports = {
  s3,
  listObjectVersions: async (spec) => s3.listObjectVersions(spec).promise(),
};
const { src, dest, series } = require('gulp');
const fs = require('fs');
const { promisify } = require('util');
const zip = require('gulp-zip');
const { S3 } = require('aws-sdk');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const codeBucket = 'odileeds-code-staging';
const packagePath = 'election-2019/lambda.zip';

const s3 = new S3({
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function package () {
  return src([
    'src/**/*.js',
  ])
    .pipe(zip('lambda.zip'))
    .pipe(dest('build'));
}

async function publish () {
  const archive = 'build/lambda.zip';
  const fileBuffer = await readFile(archive);
  const uploadResult = await s3.putObject({
    Body: fileBuffer,
    Bucket: codeBucket,
    Key: packagePath,
  }).promise();
  await writeFile('./build/.version', uploadResult.VersionId);
}

module.exports = {
  default: series(package, publish),
};

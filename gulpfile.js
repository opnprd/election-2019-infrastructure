const { createReadStream } = require('fs');
const { src, dest, series } = require('gulp');
const zip = require('gulp-zip');

const rollup = require('rollup');
const { bundleConfig, outputConfig } = require('./rollup.settings');

const { getFileHash, getS3Hash } = require('./util/hash');
const { writeFile } = require('./util/async-fs');
const { s3 } = require('./util/s3');

async function bundle () {
  const bundle = await rollup.rollup(bundleConfig);
  await bundle.write(outputConfig);
}

function package () {
  return src([
    'build/**/*.js',
  ])
    .pipe(zip('lambda.zip', { modifiedTime: new Date('2019/12/12') }))
    .pipe(dest('build'));
}

async function publish () {
  const filePath = './build/lambda.zip';
  const versionPath = './build/version';

  const latestS3Version = await getS3Hash({ Bucket: 'odileeds-code-staging', Prefix: 'election-2019/lambda.zip' });
  const localHash = await getFileHash(filePath);

  if (latestS3Version.hash === localHash) {
    console.log('Package file has not changed');
    await writeFile(versionPath, latestS3Version.version);
    return;    
  }

  const fileStream = createReadStream(filePath)

  const uploadResult = await s3.putObject({
    Bucket: 'odileeds-code-staging',
    Key: 'election-2019/lambda.zip',
    Body: fileStream,
  }).promise();

  await writeFile(versionPath, uploadResult.VersionId);
}

module.exports = {
  default: series(bundle, package, publish),
};

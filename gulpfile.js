const { createReadStream } = require('fs');
const { src, dest, series } = require('gulp');
const zip = require('gulp-zip');

const { getFileHash, getS3Hash } = require('./util/hash');
const { writeFile } = require('./util/async-fs');
const { s3 } = require('./util/s3');

function package () {
  return src([
    'src/**/*.js',
  ])
    .pipe(zip('lambda.zip', { modifiedTime: new Date('2019/12/12') }))
    .pipe(dest('build'));
}

async function publish () {
  const filePath = './build/lambda.zip';

  const latestS3Version = await getS3Hash({ Bucket: 'odileeds-code-staging', Prefix: 'election-2019/lambda.zip' });
  const localHash = await getFileHash(filePath);

  if (latestS3Version.hash === localHash) {
    console.log('Package file has not changed');
    await writeFile('./build/.version', latestS3Version.version);
    return;    
  }

  const fileStream = createReadStream(filePath)

  const uploadResult = await s3.putObject({
    Bucket: 'odileeds-code-staging',
    Key: 'election-2019/lambda.zip',
    Body: fileStream,
  }).promise();

  await writeFile('./build/.version', uploadResult.VersionId);
}

module.exports = {
  default: series(package, publish),
  package,
  publish,
};

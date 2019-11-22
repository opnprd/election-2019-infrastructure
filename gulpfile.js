const { createReadStream } = require('fs');
const { src, dest, series } = require('gulp');
const ts = require('gulp-typescript');
const zip = require('gulp-zip');

const { getFileHash, getS3Hash } = require('./util/hash');
const { writeFile } = require('./util/async-fs');
const { s3 } = require('./util/s3');

const tsProject = ts.createProject('tsconfig.json');

function compile () {
  const tsResult = tsProject.src()
    .pipe(tsProject());
  return tsResult.js.pipe(dest('build'));
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
  default: series(compile, package, publish),
  compile,
  package,
  publish,
};

const { createReadStream } = require('fs');
const { src, dest, series } = require('gulp');
const zip = require('gulp-zip');
const ProgressBar = require('progress')

const { getFileHash, getS3Hash } = require('./util/hash');
const { writeFile } = require('./util/async-fs');
const { s3 } = require('./util/s3');

const putOptions = (contents) => ({
  Bucket: 'odileeds-code-staging',
  Key: 'election-2019/lambda.zip',
  Body: contents,
});


function package () {
  return src([
    'src/**/*.js',
  ])
    .pipe(zip('lambda.zip'))
    .pipe(dest('build'));
}

async function publish () {
  const latestS3Version = await getS3Hash({ Bucket: 'odileeds-code-staging', Prefix: 'election-2019/lambda.zip' });
  const localHash = await getFileHash('./build/lambda.zip');

  if (latestS3Version.hash === localHash) {
    console.log('Package file has not changed');
    await writeFile('./build/.version', latestS3Version.version);
    return;    
  }

  const filePath = './build/lambda.zip';
  const fileStream = createReadStream(filePath)

  let progress = null
  let uploaded = 0
  const progressHandler = (stats) => {
    if (!progress) {
      progress = new ProgressBar(
        '  uploading [:bar] :percent :etas',
        { total: stats.total, width: 30 }
      )
    }
    progress.tick(stats.loaded - uploaded)
    uploaded = stats.loaded
  }

  const uploadResult = await s3.putObject(putOptions(fileStream))
    .on('httpUploadProgress', progressHandler).promise();

  await writeFile('./build/.version', uploadResult.VersionId);
}

module.exports = {
  default: series(package, publish),
};

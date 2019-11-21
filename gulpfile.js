const { S3 } = require('aws-sdk');
const fs = require('fs');
const { src, dest, series } = require('gulp');
const zip = require('gulp-zip');
const ProgressBar = require('progress')
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

const putOptions = (contents) => ({
  Bucket: 'odileeds-code-staging',
  Key: 'election-2019/lambda.zip',
  Body: contents,
});

const s3 = new S3({
  apiVersion: '2006-03-01',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

function package () {
  return src([
    'src/**/*.js',
  ])
    .pipe(zip('lambda.zip'))
    .pipe(dest('build'));
}

async function publish () {
  const filePath = './build/lambda.zip';
  const fileStream = fs.createReadStream(filePath)

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

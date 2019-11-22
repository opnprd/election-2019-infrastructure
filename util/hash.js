const { createReadStream } = require('fs');
const crypto = require('crypto');

const s3 = require('./s3');

async function getS3Hash(spec) {
  const res = await s3.listObjectVersions(spec).then(r => r.Versions.filter(v => v.IsLatest)[0]);
  return {
    hash: res.ETag.replace(/"/g, ''),
    version: res.VersionId,
  }
}

async function getFileHash(path) {
  const stream = createReadStream(path)
  const hash = crypto.createHash('md5').setEncoding('hex');
  return new Promise((resolve) => {
    stream.on('end', () => {
      hash.end()
      resolve(hash.read());
    })
    stream.pipe(hash);  
  })
}

module.exports = {
  getFileHash,
  getS3Hash,
};

import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

interface s3Location {
  bucket: string;
  path: string;
}

export async function getObjectList(params: s3Location): Promise<string[]> {
  const objects: string[] = [];

  let truncated: boolean;
  let continuationToken: string;
  do {
    const results = await s3.listObjectsV2({
      Bucket: params.bucket,
      Prefix: params.path,
      ContinuationToken: continuationToken,
    }).promise();
    objects.push(...results.Contents.map(x => x.Key));
    ({ IsTruncated: truncated, NextContinuationToken: continuationToken } = results);
  } while (truncated);
  return objects;
}

export async function getObjectContents(params: s3Location) {
  const { bucket, path } = params;
  const object = await s3.getObject({
    Bucket: bucket,
    Key: path,
  }).promise();
  return object.Body.toString('utf-8');
}

export async function putObjectContents(params: s3Location, content: string) {
  const { bucket, path } = params;
  const object = await s3.putObject({
    Bucket: bucket,
    Key: path,
    Body: content,
  }).promise();
}

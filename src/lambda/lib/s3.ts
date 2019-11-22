import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

interface bucketLocation {
  bucket: string;
  path: string;
}

export async function getObjectList(params: bucketLocation): Promise<string[]> {
  const objects: string[] = [];
  const pageSize = 2;

  let truncated: boolean;
  let continuationToken: string;
  do {
    const results = await s3.listObjectsV2({
      Bucket: params.bucket,
      Prefix: params.path,
      MaxKeys: pageSize,
      ContinuationToken: continuationToken,
    }).promise();
    objects.push(...results.Contents.map(x => x.Key));
    ({ IsTruncated: truncated, NextContinuationToken: continuationToken } = results);
  } while (truncated);
  return objects;
}


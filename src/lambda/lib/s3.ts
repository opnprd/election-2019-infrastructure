import * as AWS from 'aws-sdk';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

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

export async function runQuery(params) {
  const { bucket, path, expression } = params;
  const response = await s3.selectObjectContent({
    Bucket: bucket,
    Key: path,
    Expression: expression,
    ExpressionType: 'SQL',
    InputSerialization: { JSON: { Type: 'DOCUMENT' } },
    OutputSerialization: { JSON: {} },
  }).promise();

  const events = response.Payload;
  const result = []
  for await (const event of events) {
    if (Object.prototype.hasOwnProperty.call(event, 'Records')) {
      result.push(event.Records.Payload.toString('utf-8'));
    }
  }
  return JSON.parse(result.join(''));
}

interface putOptions {
  acl?: string,
  contentType?: string,
}

export async function putObjectContents(params: s3Location, content: string, options: putOptions ) {
  const { bucket, path } = params;
  const object = await s3.putObject({
    Bucket: bucket,
    Key: path,
    Body: content,
    ACL: options.acl,
    ContentType: options.contentType,
  }).promise();
}

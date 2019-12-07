import * as s3 from './lib/s3';
import { bucketName } from './config';

export function getSummary(key: string) {
  return async () : Promise<[string, string]> => {
    const resultSet = await s3.runQuery({
      bucket: bucketName,
      path: key,
      expression: 'SELECT s.id, s.winner.party.code from s3Object s',
    });
    const { id, code } = resultSet;
    return [ id, code ];
  }
}

export function resultReader(key: string) {
  return async () : Promise<[string, string]> => {
    const resultSet = await s3.getObjectContents({ bucket: bucketName, path: key });
    const { id, winner: { party = {}} = {}} = resultSet;
    return [ id, party.code ];
  }
}

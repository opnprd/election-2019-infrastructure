import { basename } from 'path';
import * as s3 from './lib/s3';
import { feed, link } from './lib/rss';
import batcher from './lib/batcher';
import electionData from './data/elections.json';

import { resultReader, getSummary } from './process';
import { bucketName, bucketPath, outputBucketPath, summaryFile } from './config';

function buildProcessor(key: string) {
  return async () : Promise<[string, string]> => {
    const filename = basename(key);
    const resultSet = await s3.getObjectContents({ bucket: bucketName, path: key }).then(JSON.parse);
    const {
      id,
      name,
      candidates,
      winner: {
        name: mp = undefined,
        party = {},
      } = {},
      events,
      votes: {
        margin,
        invalid,
        valid,
        electorate,
      }
    } = resultSet;
    const { demographics, elections: priorElection } = electionData.find(x => x.id === id);
    const lastElection = Object.keys(priorElection).sort().reverse()[0];
    const mostRecentWinner = priorElection[lastElection].party.code;
    const incumbent = (mostRecentWinner === resultSet.incumbent.party.code) ? undefined : resultSet.incumbent;

    const turnout = { value: valid, pc: undefined };
    if (electorate) turnout.pc = parseFloat(((valid / electorate) * 100).toFixed(1));

    const output = {
      id,
      title: name,
      demographics,
      elections: {
        ...priorElection,
        '2019-12-12': {
          type: 'general',
          mp,
          party,
          majority: margin,
          valid,
          turnout,
          invalid,
          electorate,
          candidates,
          incumbent,
        },
      },
      events,
    };
    // const feedItem = { date: new Date(summary.date), link, title: summary.message };
    // feed.addItem(feedItem);
    await s3.putObjectContents({ bucket: bucketName, path: outputBucketPath + filename }, JSON.stringify(output), { acl: 'public-read', contentType: 'application/json' });
    return [ id, party.code ];
  }
}

export async function enrich(event, context) {
  const objects = event.Records.map(r => ({ bucket: r.s3.bucket.name, key: r.s3.object.key }));
  const processors = objects.map(o => buildProcessor(o.key));
  await Promise.all(processors.map(x => x()));
}

export async function summarise(event, context) {
  const resultFiles = await s3.getObjectList({
    bucket: bucketName,
    path: bucketPath,
  });
  const processors = resultFiles.map(resultReader).reduce(batcher, []);
  // const processors = resultFiles.map(getSummary).reduce(batcher, []);
  const results = [[ 'ccode', 'first19' ]];
  while (processors.length) {
    const batch = processors.shift();
    const result : string[][] = await Promise.all(batch.map(x => x()))
    results.push(...result);
  }
  const summaryCsv = results.map(x => x.join(',')).join('\n');
  await Promise.all([
    s3.putObjectContents({ bucket: bucketName, path: summaryFile }, summaryCsv, { acl: 'public-read', contentType: 'text/csv' }),
    // s3.putObjectContents({ bucket: bucketName, path: rssFeed}, feed.rss2(), { acl: 'public-read', contentType: 'application/rss+xml' }),
    // s3.putObjectContents({ bucket: bucketName, path: atomFeed}, feed.atom1(), { acl: 'public-read', contentType: 'application/atom+xml' }),
  ]);
}

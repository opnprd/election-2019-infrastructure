import { basename } from 'path';
import * as s3 from './lib/s3';
import { feed, link } from './lib/rss';
import electionData from './data/elections.json';

const bucketName = 'odileeds-uk-election-2019';
const bucketPath = 'public/results/';

const dataEnvironment = process.env.DATA_PATH || 'develop';

const outputBucketPath = `processed/${dataEnvironment}/`;
const summaryFile = outputBucketPath + '2019-results.csv';
const atomFeed = outputBucketPath + 'feed.atom';
const rssFeed = outputBucketPath + 'feed.rss';

function buildProcessor(key: string) {
  return async () : Promise<[string, string]> => {
    const filename = basename(key);
    const resultSet = await s3.getObjectContents({ bucket: bucketName, path: key }).then(JSON.parse);
    const {
      id,
      name,
      candidates,
      winner: {
        name: mp,
        party,
      } = {},
      events: [ summary ],
      votes: {
        margin,
        invalid,
        valid,
        electorate,
      }
    } = resultSet;
    const priorElection = electionData.find(x => x.id === id).elections;
    const lastElection = Object.keys(priorElection).sort().reverse()[0];
    const mostRecentWinner = priorElection[lastElection].party.code;
    const incumbent = (mostRecentWinner === resultSet.incumbent.party.code) ? undefined : resultSet.incumbent;

    const turnout = { value: valid, pc: undefined };
    if (electorate) turnout.pc = parseFloat(((valid / electorate) * 100).toFixed(1));

    const output = {
      id,
      title: name,
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
    };
    const feedItem = { date: new Date(summary.date), link, title: summary.message };
    feed.addItem(feedItem);
    await s3.putObjectContents({ bucket: bucketName, path: outputBucketPath + filename }, JSON.stringify(output), { acl: 'public-read', contentType: 'application/json' });
    return [ id, party.code ];
  }
}

function batcher(acc, current: any, index: number) : any[] {
  const batch = Math.floor(index/10);
  acc.length = batch + 1;
  if (!Array.isArray(acc[batch])) acc[batch] = [];
  acc[batch] = [ ...acc[batch], current ];
  return acc;
}

export async function enrich(event, context) {
  const objects = event.Records.map(r => ({ bucket: r.s3.bucket.name, key: r.s3.object.key }));
  console.dir(objects);
  const resultFiles = await s3.getObjectList({
    bucket: bucketName,
    path: bucketPath,
  })
  const processors = resultFiles.map(buildProcessor).reduce(batcher, []);
  const results = [[ 'ccode', 'first19' ]];
  while (processors.length) {
    const batch = processors.shift();
    const result : string[][] = await Promise.all(batch.map(x => x()))
    results.push(...result);
  }
  const summaryCsv = results.map(x => x.join(',')).join('\n');
  await Promise.all([
    s3.putObjectContents({ bucket: bucketName, path: summaryFile }, summaryCsv, { acl: 'public-read', contentType: 'text/csv' }),
    s3.putObjectContents({ bucket: bucketName, path: rssFeed}, feed.rss2(), { acl: 'public-read', contentType: 'application/rss+xml' }),
    s3.putObjectContents({ bucket: bucketName, path: atomFeed}, feed.atom1(), { acl: 'public-read', contentType: 'application/atom+xml' }),
  ]);
}

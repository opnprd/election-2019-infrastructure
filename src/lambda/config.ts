export const bucketName = 'odileeds-uk-election-2019';
export const bucketPath = 'public/results/';

const dataEnvironment = process.env.DATA_PATH || 'develop';

export const outputBucketPath = `processed/${dataEnvironment}/`;
export const summaryFile = outputBucketPath + '2019-results.csv';
const atomFeed = outputBucketPath + 'feed.atom';
const rssFeed = outputBucketPath + 'feed.rss';

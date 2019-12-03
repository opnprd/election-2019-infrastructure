/**
 * https://www.npmjs.com/package/rss
 */ 
import * as RSS from 'rss';

const pubDate = new Date().toISOString();

const feed = new RSS({
  title: 'General Election 2019 Results',
  feed_url: '',
  site_url: 'https://britainelects.newstatesman.com/2019-results/',
  pubDate,
});

export default feed;

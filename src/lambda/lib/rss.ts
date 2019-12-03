/**
 * https://www.npmjs.com/package/rss
 */ 
import { Feed } from "feed";

const feed = new Feed({
  title: 'General Election 2019 Results',
  id: 'https://britainelects.newstatesman.com/2019-results/',
  link: 'https://britainelects.newstatesman.com/2019-results/',
  updated: new Date(),
  copyright: 'All rights reserved Britain Elects / New Statesman',
});

export default feed;

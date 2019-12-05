/**
 * https://www.npmjs.com/package/rss
 */ 
import { Feed } from "feed";

export const link = 'https://britainelects.newstatesman.com/live-results/';

export const feed = new Feed({
  title: 'General Election 2019 Results',
  id: link,
  link: link,
  updated: new Date(),
  copyright: 'All rights reserved Britain Elects / New Statesman',
});

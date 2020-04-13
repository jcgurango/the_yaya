// the reddit user account of the bot
//
var credentials = {
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
};

// the HTTP UserAgent that the bot identifies himself with
// 
var user_agent = process.env.REDDIT_USER_AGENT;

// from https://www.reddit.com/prefs/apps/
//
var app = {
  id: process.env.REDDIT_APP_ID,
  secret: process.env.REDDIT_APP_SECRET
};

// defaults
//
var defaults = {
  subreddit: process.env.SUBREDDIT || 'rphtest',
};

// slogan
//
var slogan = process.env.SLOGAN || '';

module.exports = {
  credentials: credentials,
  user_agent: user_agent,
  app: app,
  defaults: defaults,
  slogan: slogan
};

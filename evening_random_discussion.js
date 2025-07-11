var strftime = require('strftime');
var config   = require('./lib/config');
var getQuote = require('./lib/quote');
var reddit   = require('./lib/reddit');

module.exports = () => new Promise(function(resolve, reject) {
  // the actual post to be submitted
  //
  var submission = {
    'title': strftime('Evening random discussion - %b %d, %Y'),
    'text': config.slogan,
    'r': config.defaults.subreddit,
    'inboxReplies': false,
    'save': false,
  };

  // first argument from the command line can be used to
  // override the subreddit that we are submitting to
  //
  if (process.argv[2]) {
    submission.r = process.argv[2];
  }

  var silent = "Philippines" !== submission.r;

  getQuote(silent, function(quote) {
    if (quote) {
      submission.text += quote + '\n\n';
    }
    
    submission.text += 'Magandang gabi!';

    reddit.submit(submission, function(err, id) {
      if (err) {
        error(err);
      } else {
        exit('submitted ' + id);
      }
    });
  });

  function error(err) {
    reject(err);
  }

  function log(msg) {
    console.log(strftime('%F %T ') + msg);
  }

  function exit(msg) {
    log(msg);
    resolve();
  }
});
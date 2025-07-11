var strftime = require('strftime');
var config   = require('./lib/config');
var reddit   = require('./lib/reddit');

module.exports = () => new Promise(function(resolve, reject) {
  // first argument from the command line can be used to
  // override the subreddit that we are submitting to
  //
  if (process.argv[2]) {
    config.defaults.subreddit = process.argv[2];
  }

  // the actual post to be submitted
  //
  var submission = {
    'title': strftime('Nightly random discussion - %b %d, %Y'),
    'text': config.slogan + 'Magandang hatinggabi r/' + config.defaults.subreddit + '!',
    'r': config.defaults.subreddit,
    'inboxReplies': false,
    'save': false,
  };

  reddit.submit(submission, function(err, id) {
    if (err) {
      error(err);
    } else {
      log('submitted ' + id);

      reddit.getTopPost('AskReddit', function(err, post) {
        if (!err && post) {
          var text = 'Tonight\'s [Ask PHreddit](' + post.url + '): ' + post.title;
          reddit.comment('t3_' + id, text, function(err, comment_id) {
            if (err) {
              error(err);
            } else {
              exit('commented ' + comment_id);
            }
          });
        } else {
          exit('submitted ' + id);
        }
      });
    }
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

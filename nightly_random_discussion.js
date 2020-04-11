var strftime = require('strftime');
var request  = require('request-json');
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
    'text': config.slogan + 'Magandang gabi r/' + config.defaults.subreddit + '!',
    'r': config.defaults.subreddit,
    'inboxReplies': false,
    'save': false,
  };

  reddit.submit(submission, function(err, id) {
    if (err) {
      error(err);
    } else {
      log('submitted ' + id);

      var client = request.newClient('http://www.reddit.com/'),
          url = '/r/AskReddit/top/.json';

      client.get(url, function(err, res, body) {
        if (!err) {
          try {
            post = body.data.children[0].data
          } catch(e) {}
          if (post) {
            var text = 'Today\'s [Ask PHreddit](' + post.url + '): '
                    + post.title;
            reddit.comment('t3_' + id, text, function(err, id) {
              if (err) {
                error(err);
              } else {
                exit('commented ' + id);
              }
            });
          }
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

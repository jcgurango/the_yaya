var rawjs    = require('raw.js');
var strftime = require('strftime');
var entities = require('entities');
var async    = require('async');
var config   = require('./lib/config');
var fs       = require('fs');

// set up reddit api
//
var reddit = new rawjs(config.user_agent);
reddit.setupOAuth2(config.app.id, config.app.secret);

module.exports = ({
  now = new Date(),
  next_month = new Date(now.getFullYear(), now.getMonth() + 1, 1),
  subreddit = config.defaults.subreddit,
} = { }) => new Promise((resolve, reject) => {
  // first argument from the command line can be used to
  // override the subreddit that we are submitting to
  //
  if (process.argv[2]) {
    subreddit = process.argv[2];
  }

  async.waterfall([
    // authenticate at reddit
    //
    function(callback) {
      reddit.auth(config.credentials, function(err, response) {
        if (err) {
          callback('Unable to authenticate user: ' + err);
        } else {
          callback(null);
        }
      });
    },
  
    // get this month's id from db
    //
    function(callback) {
      fs.readFile(`./db/threads/${key(now)}`, { encoding: 'utf8' }, function(error, data) {
        if (error) {
          callback(error);
          return;
        }

        callback(null, data.toString().trim());
      });
    },
    // create next month's post
    // 
    function(prev_id, callback) {
      submit_next_month(prev_id, function(err, new_id) {
        callback(err, prev_id, new_id);
      });
    },
  
    // store next month's id to db
    //
    function (prev_id, new_id, callback) {
      fs.writeFile(`./db/threads/${key(next_month)}`, new_id, function(err) {
        callback(err, prev_id, new_id);
      });
    },
    // update this month's post with link to next month
    // and sticky it
    // 
    function (prev_id, new_id, callback) {
      update_this_month(prev_id, new_id, function(err) {
        callback(err);
      });
    },
    // Log that we're done.
    function(callback) {
      log('Monthly thread posted.');
      callback(null);
    }
  ], function (err) {
    if (err) {
      error(err);
      return;
    }

    resolve();
  });

  function submit_next_month(prev_id, callback) {
    var text = strftime(
        'Post your tips on events and activities happening in %B.\n\n' +
        'Be as detailed as you wish by providing context on activities and ' + 
        'events you want people to know of.\n\n' +
        'Please include links on web sources as much as possible and feel ' +
        'free to comment on events if you are going or post-event on your ' +
        'reactions to it!\n\n' + 
        '**Tip**: set the comments sorted to ***new*** below to find the ' + 
        'most recently announced events.\n\n', next_month);
  
    var submission = {
      'title': strftime('What to do in %B %Y', next_month),
      'text': config.slogan + text
            + '[<< Previous month](' + link(prev_id) + ')',
      'r': subreddit,
      'inboxReplies': false,
      'save': false,
    };

    reddit.submit(submission, function(err, id) {
      if (err) {
        callback('Unable to submit post: ' + err);
      } else {
        callback(null, id);
      }
    });
  }

  // add the link to next month's thread to this month's thread
  // and also make this month's thread sticky
  //
  function update_this_month(id, next_id, callback) {
    reddit.comments({
      link: id,
    }, function(err, res, body) {
      if (err) {
        callback(err);
      } else {
        var selftext = body.data.children[0].data.selftext;
  
        selftext = entities.decodeHTML(selftext);
  
        var new_text = ' | [Next month >>](' + link(next_id) + ')';
  
        reddit.edit('t3_' + id, selftext + new_text, function(err, response) {
          if (err) {
            callback('Unable to update this month\'s text: ' + err);
          } else {
            callback(null);
          }
        });
      }
    });
  }

  function key(date) {
    return strftime('%Y-%m', date)
  }

  function link(id) {
    return '/r/' + subreddit + '/comments/' + id + '/';
  }

  function log(msg) {
    console.log(strftime('%F %T ') + msg);
  }  

  function error(msg) {
    reject(new Error(msg));
    console.log(strftime('%F %T ERROR: ') + msg);
  }
});

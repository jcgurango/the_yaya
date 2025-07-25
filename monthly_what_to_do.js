var strftime = require('strftime');
var entities = require('entities');
var config   = require('./lib/config');
var reddit   = require('./lib/reddit');
var fs       = require('fs');

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

  // get this month's id from db
  //
  fs.readFile(`./db/threads/${key(now)}`, { encoding: 'utf8' }, function(file_err, data) {
    if (file_err) {
      error(file_err);
      return;
    }

    var prev_id = data.toString().trim();

    // create next month's post
    // 
    submit_next_month(prev_id, function(err, new_id) {
      if (err) {
        error(err);
        return;
      }

      // store next month's id to db
      //
      fs.writeFile(`./db/threads/${key(next_month)}`, new_id, function(write_err) {
        if (write_err) {
          error(write_err);
          return;
        }

        // update this month's post with link to next month
        // 
        update_this_month(prev_id, new_id, function(update_err) {
          if (update_err) {
            error(update_err);
            return;
          }

          log('Monthly thread posted.');
          resolve();
        });
      });
    });
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
    reddit.getPost(id, function(err, selftext) {
      if (err) {
        callback(err);
        return;
      }

      var decoded_text = entities.decodeHTML(selftext);
      var new_text = decoded_text + ' | [Next month >>](' + link(next_id) + ')';

      reddit.edit(id, new_text, function(edit_err) {
        if (edit_err) {
          callback('Unable to update this month\'s text: ' + edit_err);
        } else {
          callback(null);
        }
      });
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

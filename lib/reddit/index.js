var snoowrap = require('snoowrap'),
    config = require('../config'),
    reddit = null;

var authenticate = function(callback) {

  if (reddit) {
    callback(null);
    return;
  }

  try {
    console.log(config);
    reddit = new snoowrap({
      userAgent: config.user_agent,
      clientId: config.app.id,
      clientSecret: config.app.secret,
      username: config.credentials.username,
      password: config.credentials.password
    });

    callback(null);
  } catch (err) {
    callback('Unable to authenticate user: ' + err);
  }

};

var submit = function(submission, callback) {

  authenticate(function(err) {
    if (err) {
      return callback(err);
    }

    reddit.getSubreddit(submission.r).submitSelfpost({
      title: submission.title,
      text: submission.text,
      sendReplies: submission.inboxReplies !== false
    }).then(async function(post) {
      callback(null, await post.id);
    }).catch(function(err) {
      callback('Unable to submit post: ' + err);
    });
  });

};

var comment = function(parent, text, callback) {

  authenticate(function(err) {
    if (err) {
      return callback(err);
    }

    reddit.getComment(parent).reply(text).then(async function(comment) {
      callback(null, await comment.id);
    }).catch(function(err) {
      callback('Unable to comment: ' + err);
    });
  });

};


module.exports = {
  submit: submit,
  comment: comment
}

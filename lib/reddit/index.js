var snoowrap = require('snoowrap'),
    config = require('../config'),
    reddit = null;

var authenticate = function(callback) {

  if (reddit) {
    callback(null);
    return;
  }

  try {
    reddit = new snoowrap({
      userAgent: config.user_agent,
      clientId: config.app.id,
      clientSecret: config.app.secret,
      username: config.credentials.username,
      password: config.credentials.password
    });

    callback(null);
  } catch (err) {
    console.error('Unable to authenticate user: ', err);
    callback(err);
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
      console.error('Unable to submit post: ', err);
      callback(err);
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
      console.error('Unable to comment: ', err);
      callback(err);
    });
  });

};

var edit = function(postId, newText, callback) {

  authenticate(function(err) {
    if (err) {
      return callback(err);
    }

    reddit.getSubmission(postId).edit(newText).then(function(post) {
      callback(null);
    }).catch(function(err) {
      console.error('Unable to edit post: ', err);
      callback(err);
    });
  });

};

var getPost = function(postId, callback) {

  authenticate(function(err) {
    if (err) {
      return callback(err);
    }

    reddit.getSubmission(postId).fetch().then(async function(post) {
      callback(null, await post.selftext);
    }).catch(function(err) {
      console.error('Unable to get post: ', err);
      callback(err);
    });
  });

};

var getTopPost = function(subreddit, callback) {

  authenticate(function(err) {
    if (err) {
      return callback(err);
    }

    reddit.getSubreddit(subreddit).getTop({ time: 'day', limit: 1 }).then(async function(posts) {
      if (posts && posts.length > 0) {
        var post = await posts[0];
        callback(null, {
          title: await post.title,
          url: await post.url
        });
      } else {
        callback(null, null);
      }
    }).catch(function(err) {
      console.error('Unable to get top post: ', err);
      callback(err);
    });
  });

};


module.exports = {
  submit: submit,
  comment: comment,
  edit: edit,
  getPost: getPost,
  getTopPost: getTopPost
}

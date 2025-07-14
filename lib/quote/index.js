var fs = require('fs'),
    join = require('path').join,
    strftime = require('strftime'),
    reddit = require('../reddit'),
    quotefile = join(__dirname, 'quotes.json'), // optional quote array
    logfile   = join(__dirname, 'quotes.log'),  // Track posted quotes
    quotes = fs.existsSync(quotefile) ? require(quotefile) : [];

/*
 * Read the quote queue (JSON file containing array of quote strings)
 * and pick the top quote.
 *
 * If there is a quote, remove it from the quote queue.
 *
 * If there is no quote, get today's top quote from /r/quotes.
 * 
 * Parameter 'silent' can be used to prohibit any file system
 * changes such as shifting the quote queue or logging the quote.
 */
module.exports = function(silent, callback) {
  var quote = quotes.shift();

  if (quote) {
    if (!silent) {
      fs.writeFile(quotefile, JSON.stringify(quotes, null, "  "));
      log(quote);
    }
    callback(quote);
  } else {
    reddit.getTopPost('quotes', function(err, post) {
      if (!err && post) {
        quote = post.title;
      }
      if (!silent) {
        log(quote);
      }
      callback(quote);
    });
  }
}

function log(quote) {
  if (quote) {
    fs.appendFile(logfile, strftime('%F ') + quote + '\n', function(err) {
      if (err) console.error('Error writing to log file:', err);
    });
  }
}

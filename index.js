var cron = require('node-cron');

const retryRoutine = (callback, retries = 5) => async () => {
  for (let i = 0; i < retries; i++) {
    try {
      await callback();
      break;
    } catch (e) {
      console.error(e);

      if (i < retries - 1) {
        console.log('Attempting ' + (i + 2) + ' of ' + retries + '...');
      } else {
        console.log('Attempts failed.');
      }
    }
  }
};

cron.schedule('55 21  * * *', retryRoutine(require('./morning_random_discussion')));
//cron.schedule('55 3 * * *', retryRoutine(require('./afternoon_random_discussion')));
cron.schedule('55 9 * * *', retryRoutine(require('./evening_random_discussion')));
//cron.schedule('55 15 * * *', retryRoutine(require('./nightly_random_discussion')));
cron.schedule('39 2 1 * *', retryRoutine(require('./monthly_what_to_do')));

console.log('CRONs scheduled.');

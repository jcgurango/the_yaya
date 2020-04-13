var cron = require('node-cron');

cron.schedule('55 21  * * *', require('./morning_random_discussion'));
cron.schedule('55 3 * * *', require('./afternoon_random_discussion'));
cron.schedule('55 9 * * *', require('./evening_random_discussion'));
cron.schedule('55 15 * * *', require('./nightly_random_discussion'));
cron.schedule('39 2 1 * *', require('./monthly_what_to_do'));

console.log('CRONs scheduled.');

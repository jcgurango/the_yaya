var cron = require('node-cron');

cron.schedule('55 5  * * *', require('./morning_random_discussion'));
cron.schedule('55 11 * * *', require('./afternoon_random_discussion'));
cron.schedule('55 17 * * *', require('./evening_random_discussion'));
cron.schedule('55 17 * * *', require('./nightly_random_discussion'));
cron.schedule('39 2 1 * *', require('./monthly_what_to_do'));

console.log('CRONs scheduled.');

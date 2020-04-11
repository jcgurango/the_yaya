var cron = require('node-cron');

cron.schedule('55 5  * * *', require('./daily_random_discussion'));
cron.schedule('55 17 * * *', require('./nightly_random_discussion'));
cron.schedule('39 2 1 * *', require('./monthly_what_to_do'));

console.log('CRONs scheduled.');

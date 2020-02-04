const CronJob = require('cron').CronJob;
const DuelController = require('./controllers/duel.controller')
const SubscriptionController = require('./controllers/subscription.controller')

console.log('Duel Status job instantiation');
const job = new CronJob(`* */${process.env.DUEL_STATUS_CHECK} * * * *`,async function() {
    try{
        await DuelController.status()
    }catch(e) {
        console.log('Duel Status Error', e)
    }

    try{
        SubscriptionController.status()
    }catch(e) {
        console.log('Subscription Status Error', e)
    }
});

job.start();
const CronJob = require('cron').CronJob;
const DuelController = require('./controllers/duel.controller')

console.log('Duel Status job instantiation');
const job = new CronJob(`* */${process.env.DUEL_STATUS_CHECK} * * * *`,async function() {
	const d = new Date();
    console.log('Every second:', d);
    try{
        console.log('Duel Status Result', await DuelController.status())
    }catch(e) {
        console.log('Duel Status Error', e)
    }
});
// console.log('After job instantiation');
job.start();
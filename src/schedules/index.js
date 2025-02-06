const CronJob = require('cron').CronJob;
const dailyDevotionalJob = require('./dailyDevotionalJob');
const cacheRefreshJob = require('./cacheRefreshJob');

// 集中管理所有排程任務
const initializeSchedules = () => {
    // 每日靈修提醒 (早上 7:00)
    new CronJob('0 0 6 * * *', dailyDevotionalJob.execute, () => console.log('Job completed'), true, 'Asia/Taipei');
    // 快取更新 (每天凌晨 0:00)
    // new CronJob('0 0 0 * * *', cacheRefreshJob.execute, null, true, 'Asia/Taipei');

    // Token更新 (每天凌晨 3:00)
    // new CronJob('0 0 3 * * *', refreshToken.execute, null, true, 'Asia/Taipei');
};

module.exports = { initializeSchedules };
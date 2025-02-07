const lineBotService = require('../services/lineBotService');
const { formateTaipeiZone } = require('../utils/dateUtil');
const logger = require('../utils/logger');

class DailyDevotionalJob {
    async execute() {
        try {
            const today = formateTaipeiZone(new Date());
            logger.info(`Executing daily devotional job for ${today}`);

            const message = `早安，今天${today}讓我們一起讀神的話`;
            await lineBotService.broadcast(message);

            logger.info('Daily devotional message sent successfully');
        } catch (error) {
            logger.error('Error executing daily devotional job:', error);
            throw error;
        }
    }
}

module.exports = new DailyDevotionalJob(); 
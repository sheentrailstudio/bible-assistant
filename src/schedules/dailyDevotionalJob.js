const { getToday } = require('../utils/dateUtil');
const { lineMessageBoardcast } = require('../services/lineBotService');
const logger = require('../utils/logger');

class DailyDevotionalJob {
    async execute() {
        try {
            const message = `早安，今天${getToday()}讓我們一起讀神的話`;
            await lineMessageBoardcast(message);
        } catch (error) {
            logger.error('Error in daily devotional job:', error);
        }
    }
}

module.exports = new DailyDevotionalJob(); 
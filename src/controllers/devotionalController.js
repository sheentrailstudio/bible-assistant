const { formateTaipeiZone } = require('../utils/dateUtil');
const lineBotService = require('../services/lineBotService');
const logger = require('../utils/logger');

class DevotionalController {
    async sendDailyReminder(req, res) {
        try {
            const today = formateTaipeiZone(new Date());
            logger.info(`Sending daily reminder for ${today}`);

            const message = this._buildReminderMessage(today);
            await lineBotService.broadcast(message);

            return res.status(200).json({
                success: true,
                data: {
                    message: 'Daily reminder sent successfully',
                    timestamp: new Date(),
                    date: today
                }
            });

        } catch (error) {
            logger.error('Error in sendDailyReminder:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send daily reminder',
                message: error.message
            });
        }
    }

    _buildReminderMessage(date) {
        return `早安，今天${date}讓我們一起讀神的話`;
    }
}

module.exports = new DevotionalController(); 
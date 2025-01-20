const messageService = require('../services/messageService');
const logger = require('../utils/logger');

class BibleController {
    async getBibleContentByPlan(req, res) {
        try {
            const { text } = req.body;
            const { bibleVersion, date } = req.params;

            logger.info(`Fetching bible content for version: ${bibleVersion}, date: ${date}`);

            const responseText = await messageService.getTargetText(text);

            return res.status(200).json({
                success: true,
                data: responseText,
                metadata: {
                    version: bibleVersion,
                    date: date
                }
            });

        } catch (error) {
            logger.error('Error in findBibleContentByPlan:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch bible content',
                message: error.message
            });
        }
    }

    // 可以添加其他相關方法，如：
    async getBibleContentByChapter(req, res) {
        // ... implementation
    }
}

module.exports = new BibleController();
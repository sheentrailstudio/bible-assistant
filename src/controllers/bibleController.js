const messageService = require('../services/messageService');
const qtPlanService = require('../services/qtPlanService');
const logger = require('../utils/logger');

class BibleController {
    async getBibleContentByPlan(req, res) {
        try {
            const { bibleVersion, plan, date } = req.params;
            date.replace(/\-/g, '/');
            const indexText = await qtPlanService.getQTPlanIndex(plan, date);
            const responseText = await qtPlanService.getBibleContext(bibleVersion, indexText)
            return res.status(200).json({
                success: true,
                data: responseText,
                metadata: {
                    version: bibleVersion,
                    plan,
                    date
                }
            });
        } catch (error) {
            logger.error('Error in getBibleContentByPlan:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch bible content',
                message: error.message
            });
        }
    }

    async getBibleContentByChapter(req, res) {
        try {
            const { bibleVersion, book, chapter, verse } = req.params;

            const indexText = `${book}${chapter}${verse ? `-${verse}` : ''}`;
            const responseText = await qtPlanService.getBibleContext(null, indexText);

            return res.status(200).json({
                success: true,
                data: responseText,
                metadata: {
                    version: bibleVersion,
                    chapter,
                    verse: verse || null
                }
            });
        } catch (error) {
            logger.error('Error in getBibleContentByChapter:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch bible content',
                message: error.message
            });
        }
    }
}

module.exports = new BibleController();
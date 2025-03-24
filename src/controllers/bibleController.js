const messageService = require('../services/messageService');
const qtPlanService = require('../services/qtPlanService');
const logger = require('../utils/logger');
const mongoService = require('../services/mongoService');
const { formatDate } = require('../utils/dateUtil');
class BibleController {
    // request from Line , UNUSED
    async getBibleContentByPlan(req, res) {
        try {
            const { bibleVersion, plan, date: rawDate } = req.params;
            const date = formatDate(rawDate);
            
            if (!date) {
                throw new Error('Invalid date format');
            }
            
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
    // request from Line
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

    //Request from app get Data From Mongo DB ; 
    async getQTPlanList(req, res) {
        try {
            const result = await mongoService.getQTPlanList();
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error in getQTPlanList:', error);
        }
    }
    //Request from app get Data From Mongo DB ; 
    async getBibleBookList(req, res) {
        try {
            const result = await mongoService.getBookList();
            return res.status(200).json({ success: true, data: result });

        } catch (error) {
            logger.error('Error in getBibleBookList:', error);
        }
    }

    //Request from app get Data From Mongo DB ; 
    async getBibleVersionList(req, res) {
        try {
            const result = await mongoService.getVersionList();
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error in getVersionList:', error);
        }
    }

    async getBibleContent(req, res) {
        try {
            const { bibleVersion, bookId, chapterNo } = req.params;
            const result = await mongoService.getBibleContentByBook(bibleVersion, bookId, chapterNo);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            logger.error('Error in getBibleContent:', error);
        }
    }

    //get Data From Mongo DB ; Request from app or other services
    async getQTContent(req, res) {
        try {
            const { bibleVersion, plan, date, serialNumber } = req.params;
            const dateformated = formatDate(date);
            if (!dateformated) {
                logger.error('Invalid date format');
            }
            const result = await mongoService.getBibleContentByQTPlanDetail(bibleVersion, plan, dateformated, serialNumber);
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Error in getQTPlan:', error);
        }
    }
}

module.exports = new BibleController();
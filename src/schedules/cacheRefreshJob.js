const { preloadCache } = require('../services/qtPlanService');
const logger = require('../utils/logger');

class CacheRefreshJob {
    async execute() {
        try {
            await preloadCache();
        } catch (error) {
            logger.error('Error in cache refresh job:', error);
        }
    }
}

module.exports = new CacheRefreshJob(); 
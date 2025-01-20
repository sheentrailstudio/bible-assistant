const { getToday } = require('../utils/dateUtil');
const bibleSearch = require('./bibleSearch');
const planConfig = require('../constants/plan');
const messageService = require('../services/messageService');
const { buildContentKey } = require('../utils/utils');
const cache = require('./cacheService');
const logger = require('../utils/logger');

class QTPlanService {
    constructor() {
        this.cache = cache;  // 儲存對單例的引用
    }

    /**
     * 根據計畫類型和日期獲取讀經計畫索引
     */
    getQTPlanIndex = (planType, date) => {
        const planDetails = planConfig.plan[planType];
        return planDetails?.indexPath[date] || '';
    }

    /**
     * 根據索引獲取經文內容
     */
    getBibleContext = (qtIndex) => {
        if (!qtIndex) return null;
        const bibleContent = bibleSearch.indexSearch(qtIndex);
        return messageService.formatBibleContent(bibleContent);
    }

    /**
     * 處理文字請求並返回相應內容
     */
    processTextRequest = async (requestText) => {
        try {
            
            const parseResult = await messageService.analyzeText(requestText);
            const { date, content } = parseResult;
            
            const planType = parseResult.qt1y.length > 0 ? 'qt1y' : 'qt3y';
            
            const bibleContent = this.getBibleContentByPlanAndDate(
                planType, 
                date, 
                content
            );

            if (!bibleContent) {
                return '未找到相關內容';
            }

            return messageService.formateLineMessage(planType, date, bibleContent);

        } catch (error) {
            logger.error('Error processing text request:', error);
            throw new Error('處理請求時發生錯誤');
        }
    }

    /**
     * 根據計畫類型、日期和內容需求獲取經文
     */
    getBibleContentByPlanAndDate = (planType, date, needContent) => {
        if (!date) return '';

        const cacheKey = buildContentKey(planType, date, needContent);
        
        // 嘗試從快取獲取
        const cachedContent = this._getFromCache(cacheKey);
        if (cachedContent) return cachedContent;

        // 獲取新內容並快取
        const content = this._fetchAndCacheContent(
            planType, 
            date, 
            needContent, 
            cacheKey
        );

        return content;
    }

    /**
     * 預載快取內容
     */
    preloadCache = async () => {
        try {
            const today = getToday();
            const plans = Object.keys(planConfig.plan);
            
            const cachePromises = plans.flatMap(planType => [
                this._preloadPlanContent(planType, today, true),
                this._preloadPlanContent(planType, today, false)
            ]);

            await Promise.all(cachePromises);

        } catch (error) {
            logger.error('Error preloading cache:', error);
            throw new Error('快取預載失敗');
        }
    }

    // Private methods
    
    _getFromCache = (key) => {
        const cachedValue = this.cache.get(key);
        if (cachedValue) {
            logger.info(`Cache hit: ${key}`);
            return cachedValue;
        }
        return null;
    }

    _fetchAndCacheContent = (planType, date, needContent, cacheKey) => {
        const bibleIndex = this.getQTPlanIndex(planType, date);
        const content = needContent ? 
            this.getBibleContext(bibleIndex) : 
            bibleIndex;

        this.cache.set(cacheKey, content);
        logger.info(`Cache miss: ${cacheKey}, cached new content ${content}`);
        
        return content;
    }

    _preloadPlanContent = async (planType, date, needContent) => {
        const key = buildContentKey(planType, date, needContent);
        const content = this.getBibleContentByPlanAndDate(
            planType, 
            date, 
            needContent
        );
        return this.cache.set(key, content);
    }
}

module.exports = new QTPlanService(); 
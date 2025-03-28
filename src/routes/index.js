const express = require('express');
const router = express.Router();
const BibleController = require('../controllers/bibleController');
const DevotionalController = require('../controllers/devotionalController');
const WebhookController = require('../controllers/webhookController');
const SystemController = require('../controllers/systemController')

// System HealthCheck
router.get('/healthcheck', 
    SystemController.healthCheck.bind(SystemController));



// Devotional routes
router.get('/reminder', 
    DevotionalController.sendDailyReminder.bind(DevotionalController));

// from line webhook dealWithMessage
router.post('/line/webhook', WebhookController.handleMessage.bind(WebhookController));    

/**
 * @description 取得 data/qtPlan 的讀經進度
 */
// date 格式 02-02
// router.get('/assistant/:bibleVersion/:plan/:date', 
//     BibleController.getBibleContentByPlan.bind(BibleController));

/**
 * @description 取得Node Bible 包的聖經內容
 */
// router.get('/:bibleVersion/:book/:chapter/:verse?', 
//     BibleController.getBibleContentByChapter.bind(BibleController));



/**
 * @description 從mongoDB取得QT計劃清單
 */
router.get('/assistant/qtplanlist', 
    BibleController.getQTPlanList.bind(BibleController));

/**
 * @description 從mongoDB取得聖經版本清單
 */
router.get('/assistant/bibleversionlist', 
    BibleController.getBibleVersionList.bind(BibleController));
/**
 * @description 從mongoDB 取得聖經章節清單
 */
router.get('/assistant/biblebook', 
    BibleController.getBibleBookList.bind(BibleController));
    
/**
 * @description 取得某日的QT經文
 * @param {string} bibleVersion - 聖經版本
 * @param {string} plan - 讀經計劃
 * @param {string} date - 日期
 */
// get today schedule from mongoDB 取得今日的QT經文

router.get('/assistant/qt/:bibleVersion/:plan/:date/:serialNumber', 
    BibleController.getQTContent.bind(BibleController));
 /**
  * * @description 取得聖經章節清單
 */
router.get('/assistant/book/:bibleVersion/:bookId/:chapterNo', 
    BibleController.getBibleContent.bind(BibleController));

module.exports = router; 
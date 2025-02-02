const express = require('express');
const router = express.Router();
const BibleController = require('../controllers/bibleController');
const DevotionalController = require('../controllers/devotionalController');
const WebhookController = require('../controllers/webhookController');
const SystemController = require('../controllers/systemController')


// Devotional routes
router.get('/reminder', 
    DevotionalController.sendDailyReminder.bind(DevotionalController));

// from line webhook dealWithMessage
router.post('/line/webhook', WebhookController.handleMessage.bind(WebhookController));    

// Bible routes
// date 格式 02-02
router.get('/:bibleVersion/:plan/:date', 
    BibleController.getBibleContentByPlan.bind(BibleController));

// Bible routes
// router.get('/:bibleVersion/:book/:chapter/:verse?', 
//     BibleController.getBibleContentByChapter.bind(BibleController));


// HealthCheck
router.get('/healthcheck', 
    SystemController.healthCheck.bind(SystemController));


module.exports = router; 
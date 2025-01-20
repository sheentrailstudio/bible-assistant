const express = require('express');
const router = express.Router();
const BibleController = require('../controllers/bibleController');
const DevotionalController = require('../controllers/devotionalController');
const WebhookController = require('../controllers/webhookController');


// Devotional routes
router.get('/reminder', 
    DevotionalController.sendDailyReminder.bind(DevotionalController));

// from line webhook
router.post('/line/webhook', WebhookController.handleMessage.bind(WebhookController));    

// Bible routes
// router.post('/bible/content/plan/:bibleVersion/:date?', 
//     BibleController.getBibleContentByPlan.bind(BibleController));



module.exports = router; 
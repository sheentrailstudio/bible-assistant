const { getToday } = require('../utils/dateUtil');
const { getBibleContentByPlanAndDate } = require('../services/qtPlanService');
const messageService = require('../services/messageService');
const lineBotService = require('../services/lineBotService');
const logger = require('../utils/logger');

class WebhookController {
    async handleMessage(req, res) {
        res.status(200).send();
        try {
            const event = req.body.events[0];
            // Early return if not a message event
            if (event.type && event.type !== "message") {
                return;
            }

            // 非同步處理訊息
            await this._processMessage(event).catch(error => {
                logger.error('Error in _processMessage:', error);
            });

        } catch (error) {
            logger.error('Error in handleMessage:', error);
        }
    }

    async _processMessage(event) {
        const text = event.message.text;
        const responseText = await this._getResponseText(text);
        if (responseText) {
            await lineBotService.reply(responseText, event.replyToken);
        }
    }

    async _getResponseText(text) {
        // 處理問號全形、半形
        const normalizedText = this._normalizeText(text);

        // 如果是讀經計畫指令
        if (this._isReadingPlanCommand(text)) {
            const biblecontent = await this._handleReadingPlanCommand(text);
            return messageService.formatMessage(undefined, getToday(), biblecontent)
        }

        // 如果是查詢指令
        if (this._isQueryCommand(normalizedText)) {
            const { date, content, planType } = await messageService.parseMessage(text)
            const bibleContent = await getBibleContentByPlanAndDate(planType, date, content)

            //格式處理
            return messageService.formatMessage(planType, date, bibleContent);
        }

        return "";
    }

    _normalizeText(text) {
        return text.replace(/[？]/g, '?');
    }

    _isReadingPlanCommand(text) {
        return this._getReadingPlanCommands().hasOwnProperty(text);
    }

    _isQueryCommand(text) {
        return text.startsWith("?") && text.length > 2;
    }

    _getReadingPlanCommands() {
        const today = getToday();
        return {
            '一年讀經計劃 今日進度': () => getBibleContentByPlanAndDate('qt1y', today, false),
            '一年讀經計劃 今日經文': () => getBibleContentByPlanAndDate('qt1y', today, true),
            '三年讀經計劃 今日進度': () => getBibleContentByPlanAndDate('qt3y', today, false),
            '三年讀經計劃 今日經文': () => getBibleContentByPlanAndDate('qt3y', today, true),
        };
    }

    async _handleReadingPlanCommand(text) {
        const commands = this._getReadingPlanCommands();
        return await commands[text]();
    }
}

module.exports = new WebhookController(); 
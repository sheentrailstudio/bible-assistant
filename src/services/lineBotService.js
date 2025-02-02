const axios = require('axios');
const { getToken } = require('../services/tokenService');
const logger = require('../utils/logger');

class LineBotService {
    constructor() {
        this.token = getToken();
        this.broadcastUrl = process.env.LINEBOARDCAST;
        this.replyUrl = process.env.LINEREPLY;
    }

    async sendMessage(url, payload) {
        if (!this.token) {
            throw new Error('LINE Token is missing');
        }

        try {
            await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.token,
                },
            });
        } catch (error) {
            this._handleError(error);
        }
    }

    async broadcast(message) {
        if (!this.broadcastUrl) {
            throw new Error('LINE broadcast URL is missing');
        }

        const payload = this._createMessagePayload(message);

        await this.sendMessage(this.broadcastUrl, payload);
    }

    async reply(message, replyToken) {
        if (!this.replyUrl) {
            throw new Error('LINE reply URL is missing');
        }

        const payload = this._createReplyPayload(message, replyToken);
        await this.sendMessage(this.replyUrl, payload);
    }

    _createMessagePayload(message) {
        return {
            messages: [{ type: 'text', text: message }]
        };
    }

    _createReplyPayload(message, replyToken) {
        return {
            replyToken,
            messages: [{ type: 'text', text: message }]
        };
    }

    _handleError(error) {
        if (error.response) {
            logger.error(`LINE API Error: ${error.response.status}`, error.response.data);
        }
        logger.error('LINE Request Error:', error.message);
        throw error;
    }
}

module.exports = new LineBotService(); 
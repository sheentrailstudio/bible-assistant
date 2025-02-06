const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const { getToken } = require('../services/tokenService');
const logger = require('../utils/logger');

class LineBotService {
    constructor() {
        this.token = null;
        this.broadcastUrl = null;
        this.replyUrl = null;
    }

    async _initializeIfNeeded() {
        if (!this.token) {
            this.token = getToken();
        }
        if (!this.broadcastUrl) {
            this.broadcastUrl = process.env.LINEBOARDCAST;
        }
        if (!this.replyUrl) {
            this.replyUrl = process.env.LINEREPLY;
        }

        if (!this.token || !this.broadcastUrl || !this.replyUrl) {
            throw new Error('LINE configuration is missing');
        }
    }

    async sendMessage(url, payload) {
        await this._initializeIfNeeded();

        try {
            await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.token,
                },
            });
            logger.info('Message sent successfully');
        } catch (error) {
            this._handleError(error);
        }
    }

    async broadcast(message) {
        await this._initializeIfNeeded();
        const payload = this._createMessagePayload(message);
        await this.sendMessage(this.broadcastUrl, payload);
    }

    async reply(message, replyToken) {
        await this._initializeIfNeeded();
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
            logger.error('LINE API Error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            logger.error('LINE Request Error:', error.message);
        }
        throw error;
    }
}

module.exports = new LineBotService(); 
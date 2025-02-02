const { NlpManager } = require('node-nlp');
const chrono = require('chrono-node');
const logger = require('../utils/logger');
const { formateTaipeiZone } = require('../utils/dateUtil');
const plan = require('../constants/plan');

class MessageService {
    constructor() {
        this.nlpManager = new NlpManager({ languages: ['zh'], forceNER: true });
        this.initializeNLP();
    }

    initializeNLP() {
        this.nlpManager.addNamedEntityText('qt1y', '一年讀經計劃', ['zh'], ['一年', '1年']);
        this.nlpManager.addNamedEntityText('qt3y', '三年讀經計劃', ['zh'], ['三年', '3年']);
        this.nlpManager.addNamedEntityText('content', '經文內容', ['zh'], ['內文', '經文', '內容']);
    }

    // async train() {
    //     try {
    //         await this.nlpManager.train();
    //     } catch (error) {
    //         logger.error('Error training NLP manager:', error);
    //         throw new Error('NLP 訓練失敗');
    //     }
    // }

    async parseMessage(requestText) {
        try {
            const parseResult = await this.analyzeText(requestText);
            const { date, content } = parseResult;
            const contentBoolean = content.length > 0;
            const planType = parseResult.qt1y.length > 0 ? 'qt1y' : 'qt3y';
            return { "date": date, "planType": planType, "content": contentBoolean }
        } catch (error) {
            logger.error('Error in getTargetText:', error);
            return '系統繁忙，請稍後再試';
        }
    }

    formatMessage(planType, date, content) {
        //回傳的日期改成01-01 -> 01/01   
        if(planType) return `${plan.plan[planType].name} ${date} \n${content}`;
        return `${date} \n${content}`;
    }

    async analyzeText(text) {
        try {
            const [nlpResponse, parsedDate] = await Promise.all([
                this.nlpManager.process('zh', text),
                this._parseDate(text)
            ]);

            return {
                ...this._extractEntities(nlpResponse),
                date: parsedDate
            };
        } catch (error) {
            logger.error('Text analysis error:', error);
            throw new Error('文字分析失敗');
        }
    }

    formatBibleContent(contentMap) {
        if (!contentMap) return '';

        const result = [];
        const verseRegex = /[\u4e00-\u9fa5]*[0-9]*:[0-9]*\s/gm;

        contentMap.forEach((innerMap, key) => {
            if (innerMap instanceof Map) {
                this._processInnerMap(innerMap, verseRegex, result);
            }
        });

        return result.join('');
    }

    // Private methods
    _processInnerMap(innerMap, regex, result) {
        innerMap.forEach((valueArray, title) => {
            if (Array.isArray(valueArray)) {
                result.push(`\n ${title} \n`);
                valueArray.forEach(line => {
                    const formattedLine = this._formatLine(line, regex);
                    result.push(formattedLine);
                });
            }
        });
    }

    _formatLine(line, regex) {
        return line
            .replace(regex, '')
            .replace(/\n/gm, '')
            .replace(/----/gm, '\n----\n');
    }

    async _parseDate(text) {
        const date = chrono.zh.parseDate(text) || chrono.parseDate(text);
        return date ? formateTaipeiZone(new Date(date)) : null;
    }

    _extractEntities(response) {
        return response.entities.reduce((acc, entity) => {
            if (['qt1y', 'qt3y', 'content'].includes(entity.entity)) {
                acc[entity.entity].push(entity.value);
            }
            return acc;
        }, { qt1y: [], qt3y: [], content: [] });
    }

    // translate bibleversion
    translateBibleVersion(bibleVersion,text) {
        return bibleVersion.replace('NIV', '新譯本');
    }
}

module.exports = new MessageService(); 
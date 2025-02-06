require('dotenv').config();
const mongoose = require('mongoose');
const Verse = require('../models/verse');
const { getQTPlanIndex } = require('./qtPlanService');
const QTPlan = require('../models/qtPlan');
const Version = require('../models/version');
const QTPlanDetail = require('../models/qtPlanDetail');
const { formatDate } = require('../utils/dateUtil');


class MongoService {
    constructor() {
        this.connect();
        this.setupCleanup();
    }

    setupCleanup() {
        // 處理程序終止信號
        process.on('SIGINT', this.cleanup.bind(this));  // Ctrl+C
        process.on('SIGTERM', this.cleanup.bind(this)); // kill
        process.on('exit', this.cleanup.bind(this));    // 程序結束

        // 處理未捕獲的異常
        process.on('uncaughtException', async (err) => {
            console.error('Uncaught Exception:', err);
            await this.cleanup();
            process.exit(1);
        });
    }

    async cleanup() {
        try {
            if (mongoose.connection.readyState === 1) {
                console.log('Closing MongoDB connection...');
                await mongoose.connection.close();
                console.log('MongoDB connection closed');
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_URI);

            // 檢查連線狀態和數據庫名稱
            const state = mongoose.connection.readyState;
            console.log('Connection state:', {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            }[state]);

            if (state === 1) {
                const dbName = mongoose.connection.db.databaseName;
                console.log('Connected to database:', dbName);

                if (dbName !== 'bible-assistant') {
                    throw new Error(`Connected to wrong database: ${dbName}`);
                }

                // 列出所有集合
                // const collections = await mongoose.connection.db.listCollections().toArray();
                // for (const collection of collections) {
                //     const count = await mongoose.connection.db.collection(collection.name).countDocuments();
                //     console.log(`${collection.name}: ${count} documents`);
                // }
            }
        } catch (error) {
            console.error('MongoDB connection error:', error);
            console.error('Error details:', error.message);
            throw error;
        }
    }



    async getQTPlanList() {
        try {
            const resList = await QTPlan.find().select('code name -_id').lean();
            return resList;
        } catch (error) {
            console.error('獲取計畫索引時發生錯誤:', error);
            throw error;
        }
    }

    async getVersionList() {
        try {
            const resultList = await Version.find().select('code name -_id').lean();
            return resultList;
        } catch (error) {
            console.error('獲取版本列表時發生錯誤:', error);
            throw error;
        }
    }

    async getVerse(versionCode, bookName, chapter, verse) {
        try {
            if (mongoose.connection.readyState !== 1) {
                await this.connect();
            }

            // 確認版本代碼
            const versionList = await this.getVersionList();
            const query = {
                bookName: bookName,
                versionCode: versionList.find(v => v.code === versionCode)?.code || "rcuv",
            };

            // 處理章節
            if (chapter.length > 1) {
                query.chapterNo = {
                    $gte: parseInt(chapter[0]),
                    $lte: parseInt(chapter[1])
                };
            } else {
                query.chapterNo = parseInt(chapter);
            }

            // 處理經節
            if (verse && verse.length > 0) {
                if (verse.length > 1) {
                    query.verseNo = {
                        $gte: parseInt(verse[0]),
                        $lte: parseInt(verse[1])
                    };
                } else {
                    query.verseNo = parseInt(verse[0]);
                }
            }

            // 使用 aggregate 進行分組
            const verses = await Verse.aggregate([
                { $match: query },  // 先篩選符合條件的文檔
                { 
                    $group: {
                        _id: {
                            bookName: '$bookName',
                            chapterNo: '$chapterNo'
                        },
                        verses: {
                            $push: {
                                verseNo: '$verseNo',
                                text: '$text'
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id.bookName',
                        chapters: {
                            $push: {
                                chapterNo: '$_id.chapterNo',
                                verses: '$verses'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        bookName: '$_id',
                        chapters: 1
                    }
                },
                { $sort: { 'chapters.chapterNo': 1 } }
            ]);

            if (!verses?.length) {
                throw new Error('找不到指定的經文');
            }

            return verses;
        } catch (error) {
            console.error('獲取經文時發生錯誤:', error);
            throw error;
        }
    }

    async getQTPlanDetail(versionCode, planCode, date) {
        try {
            const query = {
                qtPlanCode: planCode,
                date: date
            };

            const qtDetail = await QTPlanDetail.findOne(query).select('items -_id').lean();
            if (!qtDetail) {
                throw new Error('找不到指定的計畫內容');
            }

            // 使用 Promise.all 等待所有查詢完成
            const resultList = await Promise.all(
                qtDetail.items.map(async item => {
                    try {
                        return await this.getVerse(
                            versionCode, 
                            item.bookName, 
                            item.chapter, 
                            item.verse
                        );
                    } catch (error) {
                        console.error(`Error fetching verse for ${item.bookName}:`, error);
                        return [];
                    }
                })
            );

            return resultList.filter(verses => verses.length > 0);
        } catch (error) {
            console.error('獲取計畫內容時發生錯誤:', error);
            throw error;
        }
    }
}
module.exports = new MongoService();

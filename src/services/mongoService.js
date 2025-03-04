require('dotenv').config();
const mongoose = require('mongoose');
const Verse = require('../models/verse');
const { getQTPlanIndex } = require('./qtPlanService');
const QTPlan = require('../models/qtPlan');
const Version = require('../models/version');
const QTPlanDetail = require('../models/qtPlanDetail');
const Book = require('../models/book')
const { formatDate } = require('../utils/dateUtil');


class MongoService {
    constructor() {
        this.bookNameToNoMap = new Map();  // 快取
        this.setupCleanup();
        this.init();  // 使用新的初始化方法
    }

    async init() {
        try {
            await this.connect();  // 先連接數據庫
            await this.initializeBookMap();  // 然後初始化 Map
        } catch (error) {
            console.error('初始化服務失敗:', error);
        }
    }

    setupCleanup() {
        // 處理程序終止信號
        process.on('SIGINT', async () => {  // 修改為 async 函數
            console.log('Received SIGINT. Cleaning up...');
            await this.cleanup();
            process.exit(0);  // 確保程序正確退出
        });

        process.on('SIGTERM', async () => {  // 修改為 async 函數
            console.log('Received SIGTERM. Cleaning up...');
            await this.cleanup();
            process.exit(0);
        });

        // 處理未捕獲的異常
        process.on('uncaughtException', async (err) => {
            console.error('Uncaught Exception:', err);
            await this.cleanup();
            process.exit(1);
        });
    }

    async cleanup() {
        try {
            // 確保所有資料庫連接都已關閉
            if (mongoose.connection.readyState === 1) {
                console.log('Closing MongoDB connection...');
                await mongoose.connection.close();
                console.log('MongoDB connection closed');
            }

            // 如果有 HTTP 伺服器實例，也要關閉它
            if (global.server) {
                console.log('Closing HTTP server...');
                await new Promise((resolve) => {
                    global.server.close(() => {
                        console.log('HTTP server closed');
                        resolve();
                    });
                });
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

    async initializeBookMap() {
        try {
            if (mongoose.connection.readyState !== 1) {
                console.log('等待數據庫連接...');
                await this.connect();
            }

            const books = await Book.find().lean();
            
            if (!books || books.length === 0) {
                throw new Error('找不到書卷資料');
            }

            this.bookNameToNoMap.clear();  // 清除舊的映射
            
            // 使用 Object.values() 來遍歷物件的值
            const bookEntries = Object.values(books[0]);
            
            bookEntries.forEach(book => {
                if (book.fullName && book.bookNo) {
                    this.bookNameToNoMap.set(book.fullName, book.bookNo);
                } else {
                    console.warn('無效的書卷資料:', book);
                }
            });
            // console.log('bookNameToNoMap', this.bookNameToNoMap);
            
        } catch (error) {
            console.error('初始化書卷對應關係時發生錯誤:', error);
            
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

    async getBookList() {
        try {
            const resultList = await Book.find().lean();
            return resultList
        } catch (error) {
            console.error('獲取聖經章節時發生錯誤:', error);
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

    async makeQuery(versionCode, bookId, chapterNo, verseNo) {
        // 確認版本代碼
        const versionList = await this.getVersionList();
        const query = {
            bookId: bookId,
            versionCode: versionList.find(v => v.code === versionCode)?.code || "rcuv",
        };

        // 處理章節
        if (chapterNo.length > 1) {
            query.chapterNo = {
                $gte: parseInt(chapterNo[0]),
                $lte: parseInt(chapterNo[1])
            };
        } else {
            query.chapterNo = parseInt(chapterNo);
        }

        // 處理經節
        if (verseNo && verseNo.length > 0) {
            if (verseNo.length > 1) {
                query.verseNo = {
                    $gte: parseInt(verseNo[0]),
                    $lte: parseInt(verseNo[1])
                };
            } else {
                query.verseNo = parseInt(verseNo[0]);
            }
        }
        return query;
    }

    async getVerse(versionCode, bookId, chapterNo, verseNo) {
        try {
            const query = await this.makeQuery(versionCode, bookId, chapterNo, verseNo);
            if (mongoose.connection.readyState !== 1) {
                await this.connect();
            }
            console.log('query', query);
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
                console.warn('找不到指定的經文:', {
                    versionCode,
                    bookId,
                    chapterNo,
                    verseNo
                });
                return [];
            }
            return verses;

        } catch (error) {
            console.error('獲取經文時發生錯誤:', error);
            // 返回空陣列而不是拋出錯誤
            return [];
        }
    }

    //Request from app get Data From Mongo DB 取得書卷第幾章; 
    async getBibleContentByBook(versionCode, bookId, chapterNo) {
        try {

            return await this.getVerse(
                versionCode,
                parseInt(bookId),
                parseInt(chapterNo),
                null
            );
        } catch (error) {
            console.error('獲取聖經章節時發生錯誤:', error);
            throw error;
        }
    }
    async getBibleContentByQTPlanDetail(versionCode, planCode, date) {
        try {
            // 確保 Map 已經初始化
            if (this.bookNameToNoMap.size === 0) {
                console.log('重新初始化書卷映射...');
                await this.initializeBookMap();
            }

            const query = {
                qtPlanCode: planCode,
                date: date
            };

            const qtDetail = await QTPlanDetail.findOne(query).select('items -_id').lean();
            if (!qtDetail) {
                throw new Error('找不到指定的計畫內容');
            }

            // 使用 Promise.allSettled 替代 Promise.all
            const results = await Promise.allSettled(
                qtDetail.items.map(async item => {
                    try {
                        const bookId = this.bookNameToNoMap.get(item.bookName);

                        if (!bookId) {
                            console.error(`找不到書卷 ${item.bookName} 的編號`);
                            return null;
                        }

                        const verses = await this.getVerse(
                            versionCode,
                            bookId,
                            item.chapterNo,
                            item.verseNo
                        ).catch(error => {
                            console.error(`獲取經文失敗 ${item.bookName}:`, error);
                            return null;
                        });

                        if (!verses || verses.length === 0) {
                            return null;
                        }

                        return {
                            bookName: item.bookName,
                            ...verses[0]
                        };

                    } catch (error) {
                        console.error(`處理 ${item.bookName} 時發生錯誤:`, error);
                        return null;
                    }
                })
            );

            // 從 Promise.allSettled 結果中提取成功的值
            const validResults = results
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);

            if (validResults.length === 0) {
                console.warn('沒有找到任何有效的經文');
                return [];  // 返回空陣列而不是拋出錯誤
            }

            return validResults;

        } catch (error) {
            console.error('獲取計畫內容時發生錯誤:', error);
            return [];  // 返回空陣列而不是拋出錯誤
        }
    }
}

// 創建單例並等待初始化完成
const mongoService = new MongoService();
module.exports = mongoService;
const mongoose = require('mongoose');

// 定義 Schema
const verseSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true
    },
    versionCode: {
        type: String,        
        required: true
    },
    bookId: {
        type: Number,
        required: true
    },
    bookName: {
        type: String,
        required: true
    },
    bookShortName: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    chapterNo: {
        type: Number,
        required: true
    },
    verseNo: {
        type: Number,
        required: true
    },
    text: {                 // 移除 content，只使用 text
        type: String,
        required: true
    },
    sortKey: {
        type: String,
        required: true
    }
});

// 創建並導出 Model，使用正確的集合名稱 'verse'
module.exports = mongoose.model('Verse', verseSchema, 'verse'); 
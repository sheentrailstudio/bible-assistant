const mongoService = require('../services/mongoService');
const mongoose = require('mongoose');

async function testGetVerse() {
    try {
        console.log('開始測試 getVerse 功能...');

        // 測試案例 1: 獲取單節經文
        console.log('\n測試案例 1: 獲取單節經文');
        const verses = await mongoService.getVerse('創', [1], [1,4]);
        console.log('單節經文結果:', verses);

        // 測試案例 2: 獲取多節經文
        console.log('\n測試案例 2: 獲取多節經文');
        const multipleVerses = await mongoService.getVerse('創世記', 1, 1, 3);
        console.log('多節經文結果:', multipleVerses);

        // 測試案例 3: 測試錯誤情況 - 不存在的書卷
        console.log('\n測試案例 3: 測試不存在的書卷');
        try {
             await mongoService.getVerse('不存在的書', 1, 1);
        } catch (error) {
            console.log('預期的錯誤:', error.message);
        }

        // 測試案例 4: 測試錯誤情況 - 超出範圍的章節
        console.log('\n測試案例 4: 測試超出範圍的章節');
        try {
             await mongoService.getVerse('創世記', 999, 1);
        } catch (error) {
            console.log('預期的錯誤:', error.message);
        }

        console.log('\n所有測試完成！');

    } catch (error) {
        console.error('測試過程中發生錯誤:', error);
    } finally {
        // 清理連接
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('Test completed, MongoDB connection closed');
        }
        process.exit(0);
    }
}

async function testGetVersionList() {
    try {
        console.log('開始測試 getVersionList 功能...');
        const versions = await mongoService.getVersionList();
        console.log('版本列表結果:', versions);
    } catch (error) {
        console.error('測試過程中發生錯誤:', error);
    } finally {
        // 清理連接
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('Test completed, MongoDB connection closed');
        }
        process.exit(0);
    }
}

async function testGetQTPlanList() {
    try {
        console.log('開始測試 getQTPlanList 功能...');
        const plans = await mongoService.getQTPlanList();
        console.log('計畫列表結果:', plans);
    } catch (error) {
        console.error('測試過程中發生錯誤:', error);
    } finally {
        // 清理連接
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    }
}   

// 執行異步測試
// testGetVerse();
// testGetVersionList();
// testGetQTPlanList();
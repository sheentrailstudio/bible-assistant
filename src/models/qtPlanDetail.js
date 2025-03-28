const mongoose = require('mongoose');

const item = {
    bookName: {
        type: String,
    },
    chapterNo: {
        type: Array,
    },
    verseNo: {
        type: Array,
    }
}


const QTPlanDetailSchema = {
    qtPlanCode: {
        type: String,
        required: true,
        index: true
    },
    qtPlanName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    
    items: {
        type: [item],
        required: true
    }
};

module.exports = mongoose.model('QTPlanDetail', QTPlanDetailSchema, 'qt_plan_detail');
const mongoose = require('mongoose');

const QTPlanSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    totalDays: {
        type: Number,
        require: true
    }, 
    subPlan: {
        type: Number,
        require: false
    },
    subUnit: {
        type: String,
        require: false
    }


});

module.exports = mongoose.model('QTPlan', QTPlanSchema, 'qt_plan');
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
    }
});

module.exports = mongoose.model('QTPlan', QTPlanSchema, 'qt_plan');
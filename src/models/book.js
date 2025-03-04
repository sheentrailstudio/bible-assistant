const mongoose = require('mongoose');

const bookContentSchema = new mongoose.Schema({
    shortName: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    bookNo: {
        type: Number,
        required: true,
    },
    shortNameEn: {
        type: String,
        required: true,
    },
    fullNameEn: {
        type: String,
        required: true,
    },
    totalChapter: {
        type: Number,
        required: true,
    }
}, { _id: false });

const bookSchema = new mongoose.Schema({
    type: Map,
    of: bookContentSchema
});

module.exports = mongoose.model('Book', bookSchema, 'book'); 
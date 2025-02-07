const mongoose = require('mongoose');

const VersionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    
})

module.exports = mongoose.model('Version', VersionSchema, "version");
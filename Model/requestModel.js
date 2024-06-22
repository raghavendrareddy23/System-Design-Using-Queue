const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    username: { type: String, required: true },
    request: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;

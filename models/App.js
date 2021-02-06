const mongoose = require('mongoose')

const AppSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trime: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public', 'private']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('App', AppSchema)
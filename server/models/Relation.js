const mongoose = require('mongoose');

const RelationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const Relation = mongoose.model('Relation', RelationSchema);

module.exports = { Relation };
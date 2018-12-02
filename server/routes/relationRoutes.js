const { authenticate } = require('./../middleware/authenticate');
const { Relation } = require('../models/Relation');

module.exports = app => {
    // friend request
    app.post('/relations/request', authenticate, async (req, res) => {
        // check if there is already any type of relation
        try {
            const outRelation = await Relation.find({
                userId: req.user._id,
                targetId: req.body.targetId
            });
            const inRelation = await Relation.find({
                userId: req.body.targetId,
                targetId: req.user._id
            });

            const rel = outRelation[0] || inRelation[0];
            if (rel) {
                return res.send({ relation: rel })
            }

        } catch (e) {
            res.status(400).send();
        };

        // new request
        const relation = new Relation({
            type: 'request',
            userId: req.user._id,
            targetId: req.body.targetId
        });

        try {
            const rel = await relation.save();

            res.send(rel);
        } catch (e) {
            res.status(400).send(e);
        };
    });

    // returns object with information about incoming and outgoing requests
    app.get('/relations/request', authenticate, async (req, res) => {

        try {
            const outRequests = await Relation.find({
                type: 'request',
                userId: req.user._id
            });
            const inRequests = await Relation.find({
                type: 'request',
                targetId: req.user._id
            });

            if (!outRequests[0] && !inRequests[0]) {
                return res.status(404).send();
            }

            res.send({ 'outRequests': outRequests, 'inRequests': inRequests });
        } catch (e) {
            res.status(400).send();
        };
    });

    // friend request confirmation
    app.get('/relations/confirm/:id', authenticate, async (req, res) => {

        try {
            const relation = await Relation.findOneAndUpdate({
                userId: req.params.id,
                targetId: req.user._id
            }, { $set: { type: 'friendship' } }, { new: true });

            if (!relation) {
                return res.status(404).send();
            };

            res.send(relation);
        } catch (e) {
            res.status(400).send();
        };
    });


    // receiving friend list 
    app.get('/relations/friends', authenticate, async (req, res) => {

        try {
            const friendsOut = await Relation.find({
                type: 'friendship',
                userId: req.user._id
            });
            const friendsIn = await Relation.find({
                type: 'friendship',
                targetId: req.user._id
            });

            const friends = [...friendsOut, ...friendsIn];

            if (!friends[0]) {
                return res.status(404).send();
            }

            res.send(friends);
        } catch (e) {
            res.status(400).send();
        };
    });
};
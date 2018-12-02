const { User } = require('./../models/User');
const { authenticate } = require('./../middleware/authenticate');
const _ = require('lodash');

module.exports = app => {
    // create user
    app.post('/users', async (req, res) => {

        const body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName']);
        const user = new User(body);

        try {
            await user.save();
            const token = user.generateAuthToken();

            res.header('x-auth', token).send(user);
        } catch (e) {
            res.status(400).send(e);
        };
    });

    // returns currently authenticated user
    app.get('/users/me', authenticate, (req, res) => {

        res.send(req.user);

    });

    // login
    app.post('/users/login', async (req, res) => {

        const body = _.pick(req.body, ['email', 'password']);

        try {
            const user = await User.findByCredentials(body.email, body.password);
            const token = await user.generateAuthToken();

            res.header('x-auth', token).send(user);
        } catch (e) {
            res.status(400).send();
        };
    });


    app.delete('/users/me/token', authenticate, async (req, res) => {
        try {
            await req.user.removeToken(req.token);

            res.status(200).send();
        } catch (e) {
            res.status(400).send();
        }
    });

    app.get('/users/all', authenticate, async (req, res) => {
        try {
            const users = await User.find();

            res.send(users);
        } catch (e) {
            res.status(400).send(e);
        };
    });

    //find user or get all users
    app.get('/users/all/:firstName/:lastName', authenticate, async (req, res) => {
        // if no params return all users
        if (!req.params) {
            try {
                const users = await User.find();

                res.send(users);
            } catch (e) {
                res.status(400).send(e);
            }
        }
        // returns exactly user according first and last names from params
        const { firstName } = req.params;
        const { lastName } = req.params;

        try {
            const user = await User.find({
                firstName,
                lastName
            });

            if (!user[0]) {
                return res.status(404).send();
            }

            res.send(user);
        } catch (e) {
            res.status(400).send();
        }
    });

};
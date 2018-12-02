const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { User } = require('./../../models/User');
const { Relation } = require('./../../models/Relation');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const userThreeId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'doe@example.com',
  password: 'userOnePass',
  firstName: 'John',
  lastName: 'Doe',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  firstName: 'Jane',
  lastName: 'Doe',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, 'abc123').toString()
  }]
}, {
  _id: userThreeId,
  email: 'ann@example.com',
  password: 'userTwoPass',
  firstName: 'Anna',
  lastName: 'Blum',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, 'abc123').toString()
  }]
}];

const populateUsers = async () => {
  await User.remove({});

  const userOne = new User(users[0]).save();
  const userTwo = new User(users[1]).save();
  const userThree = new User(users[2]).save();

  return Promise.all([userOne, userTwo, userThree])
};

const populateRelations = async () => {
  await Relation.remove({});
};

module.exports = { users, populateUsers, populateRelations };
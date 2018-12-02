const expect = require('expect');
const request = require('supertest');
const { app } = require('./../server');
const { Relation } = require('./../models/Relation');
const { users, populateRelations } = require('./seed/seed');

populateRelations();

describe(' POST /relations/request', () => {

  it('should not create new relation request if user not authenticated', (done) => {
    request(app)
      .post('/relations/request')
      .send({
        targetId: users[1]._id
      })
      .expect(401)
      .expect(res => {
        expect(res.body.outRequests).toBe(undefined)
      })
      .end(done)

  });

  it('should create new relation request', done => {
    request(app)
      .post('/relations/request')
      .set('x-auth', users[0].tokens[0].token)
      .send({ targetId: users[1]._id })
      .expect(200)
      .expect(res => {
        expect(res.body.type).toBe('request');
        expect(res.body.userId).toBe(users[0]._id.toString());
        expect(res.body.targetId).toBe(users[1]._id.toString());
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        Relation.find({
          userId: users[0]._id,
          targetId: users[1]._id
        }).then(rel => {
          expect(rel.length).toBe(1);
          expect(rel[0].type).toBe('request');
          done();
        }).catch(e => done(e));
      });
  });

  it('should not create new relation request if relation between this users already exists', done => {
    request(app)
      .post('/relations/request')
      .set('x-auth', users[0].tokens[0].token)
      .send({ targetId: users[1]._id })
      .expect(200)
      .expect(res => {
        expect(res.body.relation.targetId).toBe(users[1]._id.toString());
      })
      .end(done)
  });

});

describe('GET /relations/request', () => {

  it('should provide object with information about incoming and outgoing requests', done => {
    request(app)
      .get('/relations/request')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.outRequests[0].userId).toBe(users[0]._id.toString());
        expect(res.body.outRequests[0].targetId).toBe(users[1]._id.toString());
        expect(res.body.outRequests[0].type).toBe('request');
      })
      .end(done)
  });

  it('should not return object with information about incoming and outgoing requests if user is not authenticated', done => {
    request(app)
      .get('/relations/request')
      .expect(401)
      .expect(res => {
        expect(res.body.outRequests).toBe(undefined)
      })
      .end(done)
  });

});

describe(' GET /relations/confirm/:id', () => {

  it('should confirm friend request', done => {
    request(app)
      .get(`/relations/confirm/${users[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.type).toBe('friendship');
      })
      .end(done)
  });

  it('should not confirm friend request if user is not authenticated', done => {
    request(app)
      .get(`/relations/confirm/${users[0]._id.toHexString()}`)
      .expect(401)
      .expect(res => {
        expect(res.body.outRequests).toBe(undefined)
      })
      .end(done)
  });
});

describe('GET /relations/friends', () => {
  it('should return friends list', done => {
    request(app)
      .get('/relations/friends')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body[0].type).toBe('friendship');
      })
      .end(done)
  });

  it('should not return friends list if user is not authenticated', done => {
    request(app)
      .get('/relations/friends')
      .expect(401)
      .expect(res => {
        expect(res.body[0]).toBe(undefined)
      })
      .end(done)
  });

});
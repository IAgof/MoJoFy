// test/components/project/track/test-track-acl.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const mockedResponse = {
  faked: true,
  error: sinon.spy()
};

const trackStore = require('../../../../components/project/track/store');
const acl = proxyquire('../../../../components/project/track/acl', {

  '../../../network/response': mockedResponse
});

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllMedias() {
	return testUtil.removeAllEntities('track');
}

// (jliarte): 20/09/18 wait time for store.get
const storeTimeout = 50;

describe('Media acl', () => {
	describe('middleware - auth user', () => {
    beforeEach(removeAllMedias);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    it('calls Response.error if no req.user', () => {
      const req = {method: 'get'};
      const res = {};
      const next = sinon.spy();
      acl.middleware(req, res, next);
      sinon.assert.called(mockedResponse.error);
      sinon.assert.calledWith(mockedResponse.error, req, res, next, 401, 'Unauthenticated');
    });

  });

  describe('middleware GET track', () => {
    beforeEach(removeAllMedias);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    it('allows guest user access an owned track', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: track.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user access a not owned track with 404', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user access a not owned track', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });

  describe('middleware GET tracks (list)', () => {
    beforeEach(removeAllMedias);
    afterEach(() => { mockedResponse.error.resetHistory(); });

    it('allows guest user list tracks with created_by filter', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = { method: 'get',
        headers: { authorization: 'Bearer: auth' },
        params: {},
        query: {},
        baseUrl: 'base/track',
        user: { userProfile: { role: 'guest', _id: 'not-the-same-user-id' } }
      };
      const send = { send: sinon.spy() };
      const res = { status: sinon.stub().returns(send) };
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, () => {
            req.query.created_by.should.equal(req.user.userProfile._id);
            done();
          });
        });
    });

    it('allows admin user list tracks without created_by filter', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = { method: 'get',
        headers: { authorization: 'Bearer: auth' },
        params: {},
        query: {},
        baseUrl: 'base/track',
        user: { userProfile: { role: 'admin', _id: 'not-the-same-user-id' } }
      };
      const send = { send: sinon.spy() };
      const res = { status: sinon.stub().returns(send) };
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, () => {
            req.query.should.not.have.property('created_by');
            done();
          });
        });
    });

  });

  describe('middleware PUT track', () => {
    beforeEach(removeAllMedias);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    xit('allows guest user create a track with PUT', (done) => { // TODO(jliarte): 20/09/18 should allow this "missuse" of PUT method??? now it's allowed
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: 'anyId'},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: 'userId'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      acl.middleware(req, res, function (req, res, next) {
        done();
      });
    });


    it('allows guest user update an owned track', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: track.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user update a not owned track with 404', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user update a not owned track', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });

  describe('middleware DELETE track', () => {
    beforeEach(removeAllMedias);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    it('allows guest user delete an owned track', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'delete',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: track.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user delete a not owned track with 404', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'delete',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user delete a not owned track', (done) => {
      const track = {
        id: 'trackId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'delete',
        headers: {authorization: 'Bearer: auth'},
        params: {trackId: track.id},
        baseUrl: 'base/track',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      trackStore.upsert(track)
        .then(createdComposition => {
          console.log("track created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });


});
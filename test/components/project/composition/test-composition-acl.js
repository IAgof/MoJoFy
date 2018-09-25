// test/components/project/composition/test-composition-acl.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const mockedResponse = {
  faked: true,
  error: sinon.spy()
};

const compositionStore = require('../../../../components/project/composition/store');
const acl = proxyquire('../../../../components/project/composition/acl', {

  '../../../network/response': mockedResponse
});

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllCompositions() {
	return testUtil.removeAllEntities('composition');
}

// (jliarte): 20/09/18 wait time for store.get
const storeTimeout = 50;

describe('Composition acl', () => {
	describe('middleware - auth user', () => {
    beforeEach(removeAllCompositions);
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

  describe('middleware GET composition', () => {
    beforeEach(removeAllCompositions);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    it('allows guest user access an owned composition', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: composition.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user access a not owned composition with 404', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user access a not owned composition', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });

  describe('middleware GET compositions (list)', () => {
    beforeEach(removeAllCompositions);
    afterEach(() => { mockedResponse.error.resetHistory(); });

    it('allows guest user list compositions with created_by filter', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = { method: 'get',
        headers: { authorization: 'Bearer: auth' },
        params: {},
        query: {},
        baseUrl: 'base/composition',
        user: { userProfile: { role: 'guest', _id: 'not-the-same-user-id' } }
      };
      const send = { send: sinon.spy() };
      const res = { status: sinon.stub().returns(send) };
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, () => {
            req.query.created_by.should.equal(req.user.userProfile._id);
            done();
          });
        });
    });

    it('allows admin user list compositions without created_by filter', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = { method: 'get',
        headers: { authorization: 'Bearer: auth' },
        params: {},
        query: {},
        baseUrl: 'base/composition',
        user: { userProfile: { role: 'admin', _id: 'not-the-same-user-id' } }
      };
      const send = { send: sinon.spy() };
      const res = { status: sinon.stub().returns(send) };
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, () => {
            req.query.should.not.have.property('created_by');
            done();
          });
        });
    });

  });

  describe('middleware PUT composition', () => {
    beforeEach(removeAllCompositions);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    xit('allows guest user create a composition with PUT route', (done) => { // TODO(jliarte): 20/09/18 should allow this "missuse" of PUT method???
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {mediaId: 'anyId'},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: 'userId'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      acl.middleware(req, res, function (req, res, next) {
        done();
      });
    });

    it('allows guest user update an owned composition', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: composition.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user update a not owned composition with 404', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user update a not owned composition', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'put',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });

  describe('middleware DELETE composition', () => {
    beforeEach(removeAllCompositions);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    it('allows guest user delete an owned composition', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'delete',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: composition.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user delete a not owned composition with 404', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'delete',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user delete a not owned composition', (done) => {
      const composition = {
        id: 'compositionId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'delete',
        headers: {authorization: 'Bearer: auth'},
        params: {compositionId: composition.id},
        baseUrl: 'base/composition',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      compositionStore.upsert(composition)
        .then(createdComposition => {
          console.log("composition created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });


});
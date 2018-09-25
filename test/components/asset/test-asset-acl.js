// test/components/project/asset/test-asset-acl.js
// test/components/asset/test-asset-acl.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const mockedResponse = {
  faked: true,
  error: sinon.spy()
};

const assetStore = require('../../../components/asset/store');
const acl = proxyquire('../../../components/asset/acl', {

  '../../network/response': mockedResponse
});

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllMedias() {
	return testUtil.removeAllEntities('asset');
}

// (jliarte): 20/09/18 wait time for store.get
const storeTimeout = 50;

describe('Asset acl', () => {
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

  describe('middleware GET asset', () => {
    beforeEach(removeAllMedias);
    afterEach(() => {
      mockedResponse.error.resetHistory();
    });

    it('allows guest user access an owned asset', (done) => {
      const asset = {
        id: 'assetId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {assetId: asset.id},
        baseUrl: 'base/asset',
        user: {userProfile: {role: 'guest', _id: asset.created_by}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      assetStore.upsert(asset)
        .then(createdComposition => {
          console.log("asset created ", createdComposition);
          acl.middleware(req, res, function (req, res, next) {
            done();
          });
        });
    });

    it('rejects guest user access a not owned asset with 404', (done) => {
      const asset = {
        id: 'assetId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {assetId: asset.id},
        baseUrl: 'base/asset',
        user: {userProfile: {role: 'guest', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      assetStore.upsert(asset)
        .then(createdComposition => {
          console.log("asset created ", createdComposition);
          return acl.middleware(req, res, next);
        })
        .then(result => new Promise(resolve => setTimeout(() => resolve(result), storeTimeout))) // (jliarte): 18/07/18 wait for store call
        .then(() => {
          sinon.assert.called(mockedResponse.error);
          sinon.assert.calledWith(mockedResponse.error, req, res, next, 404);
          done();
        });
    });

    it('allows admin user access a not owned asset', (done) => {
      const asset = {
        id: 'assetId.1',
        created_by: 'userId.1'
      };
      const req = {
        method: 'get',
        headers: {authorization: 'Bearer: auth'},
        params: {assetId: asset.id},
        baseUrl: 'base/asset',
        user: {userProfile: {role: 'admin', _id: 'not-the-same-user-id'}}
      };
      const send = {send: sinon.spy()};
      const res = {status: sinon.stub().returns(send)};
      const next = sinon.stub();
      assetStore.upsert(asset)
        .then(createdComposition => {
          console.log("asset created ", createdComposition);
          acl.middleware(req, res, () => done());
        });
    });

  });

  describe('middleware GET assets (list)', () => {
    beforeEach(removeAllMedias);
    afterEach(() => { mockedResponse.error.resetHistory(); });

    it('allows guest user list assets with created_by filter', (done) => {
      const asset = {
        id: 'assetId.1',
        created_by: 'userId.1'
      };
      const req = { method: 'get',
        headers: { authorization: 'Bearer: auth' },
        params: {},
        query: {},
        baseUrl: 'base/asset',
        user: { userProfile: { role: 'guest', _id: 'not-the-same-user-id' } }
      };
      const send = { send: sinon.spy() };
      const res = { status: sinon.stub().returns(send) };
      const next = sinon.stub();
      assetStore.upsert(asset)
        .then(createdComposition => {
          console.log("asset created ", createdComposition);
          acl.middleware(req, res, () => {
            req.query.created_by.should.equal(req.user.userProfile._id);
            done();
          });
        });
    });

    it('allows admin user list assets without created_by filter', (done) => {
      const asset = {
        id: 'assetId.1',
        created_by: 'userId.1'
      };
      const req = { method: 'get',
        headers: { authorization: 'Bearer: auth' },
        params: {},
        query: {},
        baseUrl: 'base/asset',
        user: { userProfile: { role: 'admin', _id: 'not-the-same-user-id' } }
      };
      const send = { send: sinon.spy() };
      const res = { status: sinon.stub().returns(send) };
      const next = sinon.stub();
      assetStore.upsert(asset)
        .then(createdComposition => {
          console.log("asset created ", createdComposition);
          acl.middleware(req, res, () => {
            req.query.should.not.have.property('created_by');
            done();
          });
        });
    });

  });

});
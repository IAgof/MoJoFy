// test/components/user/test-user-controller.js

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils')

const userStoreCB = require('../../../components/user/store');
const userStore = Bluebird.promisifyAll(userStoreCB, { promisifier: PromisifierUtils.noErrPromisifier });

const userStoreSpy = {
	faked: true,
	upsert: sinon.stub().callsArgWith(1, true)
};

const billingSpy = {
  faked: true,
  givePromotionProductToUserForAYear: sinon.stub().returns(Promise.resolve())
};

emailNotificationsSpy = {
  faked: true,
  sendPrehistericPromotionWelcomeEmail: sinon.stub().returns(Promise.resolve())
};

// TODO(jliarte): 16/07/18 setup in beforeEach?
const userCtrlCB = proxyquire('../../../components/user', {
	'./store': userStoreSpy,
  '../billing': billingSpy,
  '../email_notifications': emailNotificationsSpy
});
const userCtrl = Bluebird.promisifyAll(userCtrlCB, { promisifier: PromisifierUtils.noErrPromisifier });

//Require the dev-dependencies
const assert = require('assert');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

const testUtil = require('../../test-util');

function removeAllUsers() {
  return testUtil.removeAllEntities('user');
}

describe('User Controller', () => {
	describe('decreaseVideoCounterAsync', () => {
		beforeEach(removeAllUsers);
    afterEach(() => { userStoreSpy.upsert.resetHistory(); });


    it('should decrease video counter', () => {
			const userId = 1;
			const user = {
				_id: userId,
				videoCount: 42
			};

			console.log("calling user store upsert with ", user);
			return userStore.upsertAsync(user)
				.then(res => {
					return userCtrl.decreaseVideoCounterAsync(userId);
				})
				.then(res => {
					console.log("user decreaseVideoCounterAsync called ", res);
					sinon.assert.called(userStoreSpy.upsert);
					let upsertArgs = userStoreSpy.upsert.getCall(0).args;
					upsertArgs[0].id.should.equal(userId);
					upsertArgs[0].videoCount.should.equal(41);
				});
		});

	});

  describe('setPrehistericUser', () => {
    beforeEach(removeAllUsers);
    afterEach(() => { userStoreSpy.upsert.resetHistory(); });

    it('should set prehisteric field to true if not set already', () => {
      const userId = 'userId';
      const user = {
        id: userId,
      };

      console.log("calling user store upsert with ", user);
      return userStore.upsertAsync(user)
        .then(res => {
          console.log("Result upserting user ", res);
        	user._id = userId; // TODO(jliarte): 25/09/18 FIXME: upsert modifies param
          console.log("User is ", user);
          return userCtrl.setPrehistericUser(user, true);
        })
        .then(res => {
          console.log("user setPrehistericUser called, res ", res);
          return userCtrl.listAsync(null);
        })
	      .then(users => {
	      	console.log("users are ", users);
	      	users.should.have.length(1);
	      	users[0].prehisteric.should.equal(true);
        });
    });

    it('should not set prehisteric field to true if already set', () => {
      const userId = 'userId';
      const user = {
        id: userId,
        prehisteric: true
      };

      console.log("calling user store upsert with ", user);
      return userStore.upsertAsync(user)
        .then(res => {
          console.log("Result upserting user ", res);
          user._id = userId; // TODO(jliarte): 25/09/18 FIXME: upsert modifies param
          console.log("User is ", user);
          return userCtrl.setPrehistericUser(user, false);
        })
        .then(res => {
          console.log("user setPrehistericUser called, res ", res);
          return userCtrl.listAsync(null);
        })
        .then(users => {
          console.log("users are ", users);
          users.should.have.length(1);
          users[0].prehisteric.should.equal(true);
        });
    });

    it('should call givePromotionProductToUserForAYear if prehisteric not set already', () => {
      const userId = 'userId';
      const user = {
        id: userId,
      };

      console.log("calling user store upsert with ", user);
      return userStore.upsertAsync(user)
        .then(res => {
          console.log("Result upserting user ", res);
          user._id = userId; // TODO(jliarte): 25/09/18 FIXME: upsert modifies param
          console.log("User is ", user);
          return userCtrl.setPrehistericUser(user, true);
        })
        .then(res => {
          console.log("user setPrehistericUser called, res ", res);
          sinon.assert.called(billingSpy.givePromotionProductToUserForAYear);
          sinon.assert.calledWith(billingSpy.givePromotionProductToUserForAYear, user, 'hero');
        });
    });

    it('should call sendPrehistericPromotionWelcomeEmail if prehisteric not set already', () => {
      const userId = 'userId';
      const user = {
        id: userId,
      };

      console.log("calling user store upsert with ", user);
      return userStore.upsertAsync(user)
        .then(res => {
          console.log("Result upserting user ", res);
          user._id = userId; // TODO(jliarte): 25/09/18 FIXME: upsert modifies param
          console.log("User is ", user);
          return userCtrl.setPrehistericUser(user, true);
        })
        .then(res => {
          console.log("user setPrehistericUser called, res ", res);
          sinon.assert.called(emailNotificationsSpy.sendPrehistericPromotionWelcomeEmail);
          sinon.assert.calledWith(emailNotificationsSpy.sendPrehistericPromotionWelcomeEmail, user);
        });
    });

  });


});
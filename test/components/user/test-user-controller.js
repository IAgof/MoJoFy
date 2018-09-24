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

// TODO(jliarte): 16/07/18 setup in beforeEach?
const userCtrlCB = proxyquire('../../../components/user', {
	'./store': userStoreSpy,
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
	// return userStore.listAsync({})
	// 	.then((users) => {
	// 		if (users.length == 0) {
	// 			return Promise.resolve();
	// 		}
	// 		console.log("removing existing users ", users.length, users);
	// 		return Promise.all(users.map(user => userStore.removeIdAsync(user._id))).then(console.log);
	// 	});
  return testUtil.removeAllEntities('user');
}

describe('User Controller', () => {
	describe('decreaseVideoCounterAsync', () => {
		beforeEach(removeAllUsers);


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

});
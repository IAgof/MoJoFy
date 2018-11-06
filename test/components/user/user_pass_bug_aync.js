// test/components/user/user_pass_bug_aync.js

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const userStoreCB = require('../../../components/user/store');
const userComponentCB = require('../../../components/user');

const userStore = Bluebird.promisifyAll(userStoreCB, {promisifier: PromisifierUtils.noErrPromisifier});
const userComponent = Bluebird.promisifyAll(userComponentCB, {promisifier: PromisifierUtils.noErrPromisifier});

//Require the dev-dependencies
let chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
let should = chai.should();

const testUtil = require('../../test-util');

function removeAllUsersAsync() {
	// return userStore.listAsync({})
	// 	.then((users) => {
	// 		if (users.length == 0) {
	// 			return Promise.resolve();
	// 		}
	// 		let userLenght = users.length;
	// 		console.log("removing existing users ", userLenght, users);
	// 		return Promise.all(users.map(user => userStore.removeIdAsync(user._id))).then(console.log);
	// 	});
  return testUtil.removeAllEntities('user');
}

describe('Users', () => {
	/*
		* Test and explore the bug of user password changes
		*/
	describe('User store upsert', () => {
		beforeEach(removeAllUsersAsync);
		// beforeEach(() => { return removeAllUsersAsync() });

		it('should create a user', () => {
			const user = {
				id: 'userId',
				email: 'email@email.com',
				username: 'username',
			};
			console.log("calling user store upsert with user ", user);

			return userStore.upsertAsync(user).then(res => {
				console.log("user created ", res);
				console.log("res created ", res);
				return userStore.listAsync({});
			})
				.then(users => {
					console.log("retrieved users are ", users);
					users.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(users[0]);
					console.log("expected ", user);
					console.log("actual", users[0]);
					users[0].should.deep.equal(user); // _id
				});
		});

		it('should not modify a created user after update', () => {
			const user = {
				email: 'email@email.com',
				username: 'username',
			};
			let userId;
			console.log("calling user store upsert with user ", user);

			return userStore.upsertAsync(user)
				.then(res => {
					console.log("user created ", res);
					return userStore.listAsync({email: 'email@email.com'});
				})
				.then(users => {
					console.log("retrieved users are ", users);
					users.should.have.length(1);

					userId = users[0]._id;
					return userStore.getAsync(userId);
				})
				.then(retrievedUser => {
					retrievedUser.username = 'new username';
					retrievedUser.id = userId;
					return userStore.upsertAsync(retrievedUser);
				})
				.then(() => {
					return userStore.getAsync(userId);
				})
				.then(retrievedUser => {
					delete retrievedUser.creation_date;
					delete retrievedUser.modification_date;
          retrievedUser.should.deep.equal(
            { email: 'email@email.com', username: 'new username' });
				});
		});

	});

	describe('User component add', () => {
		// beforeEach(() => { return removeAllUsersAsync() });
		beforeEach(removeAllUsersAsync);

		xit('should not create non existent fields', () => { // TODO(jliarte): 24/09/18 update when refactor user component with model utils
			const user = {
				email: 'email@email.com',
				username: 'username'
			};

			return userComponent.addAsync(user, null)
				.then(res => {
						return userStore.listAsync({});
					})
				.then(users => {
					users.should.have.length(1);
					const userId = users[0]._id;

					return userStore.getAsync(userId).should.eventually.deep.equal(
						{ email: 'email@email.com', username: 'username' });
				});
		});

	});

	describe('User component update', () => {
		beforeEach(removeAllUsersAsync);

		it('should not change password if not provided', () => {
			const user = {
				email: 'email@email.com',
				username: 'username',
				password: 'pass'
			};
			let userId;
			let storedPassword;
			let storedUser;

			return userComponent.addAsync(user, null)
				.then(() => {
					return userStore.listAsync({});
				})
				.then(users => {
					users.should.have.length(1);
					userId = users[0]._id;
					storedPassword = users[0].password;

					return userStore.getAsync(userId);
				})
				.then(retrievedUser => {
					storedUser = retrievedUser;
					storedUser.id = userId;
					storedUser.username = 'new_username';
					return userComponent.updateAsync(storedUser, undefined, undefined);
				})
				// TODO(jliarte): explore multiArgs (& filter)
				.then((res, msg, status) => {
					// check user fields
					console.log("Res of update is ", res, status);
					console.log("msg of update is ", msg);
					return userStore.getAsync(userId).should.eventually.have.property('password').and.equal(storedPassword);
				});
		});

		xit('should not change not specified fields', () => { // TODO(jliarte): 24/09/18 recover when refactor user component with model utils
			const user = {
				email: 'email@email.com',
				username: 'username'
			};
			let userId;
			let storedUser;

			return userComponent.addAsync(user, null)
				.then(() => {
					return userStore.listAsync({});
				})
				.then(users => {
					users.should.have.length(1);
					userId = users[0]._id;

					return userStore.getAsync(userId);
				})
				.then(retrievedUser => {
					storedUser = retrievedUser;
					storedUser.id = userId;
					storedUser.username = 'new_username';
					return userComponent.updateAsync(storedUser, user);
				})
				.then((res, msg, status) => {
					// check user fields
					console.log("Res of update is ", res, status);
					console.log("msg of update is ", msg);
					delete storedUser.id;
					return userStore.getAsync(userId).should.eventually.deep.equal(storedUser);
				});
		});

	});

});
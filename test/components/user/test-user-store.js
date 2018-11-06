// test/components/user/test-user-store.js

// During the test the env variable is set to test
const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils')

const userStoreCB = require('../../../components/user/store');
const userStore = Bluebird.promisifyAll(userStoreCB, { promisifier: PromisifierUtils.noErrPromisifier });

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllUsers() {
	return testUtil.removeAllEntities('user');
}

describe('User store', () => {
	describe('upsert', () => {
		beforeEach(removeAllUsers);

		it('should create a user', () => {
			const user = {
				id: 'assetId',
				name: 'user name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'user/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return userStore.upsertAsync(user)
				.then(createdUser => {
					console.log("user created ", createdUser);
					return userStore.listAsync({});
				})
				.then(users => {
					console.log("retrieved users are ", users);
					users.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(users[0]);
					console.log("expected ", user);
					console.log("actual", users[0]);
					users[0].should.deep.equal(user);
				});
		});

		it('should assign an id if not provided', () => {
			const user = {
				name: 'user name',
			};
			return userStore.upsertAsync(user)
				.then(createdUser => {
					console.log("user created ", createdUser);
					return userStore.listAsync({});
				})
				.then(user => {
					console.log("retrieved user are ", user);
					user.should.have.length(1);
					user[0].should.have.property('_id');
				});
		});

		it('should set creation and modification date on a new user', () => {
			const user = {
				name: 'user name',
			};
			return userStore.upsertAsync(user)
				.then(createdAsset => {
					console.log("user created ", createdAsset);
					return userStore.listAsync({});
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					delete assets[0]._id;
					assets[0].should.have.property("creation_date");
					assets[0].should.have.property("modification_date");
				});
		});

		it('should not modify input param', () => {
			const user = {
				id: 'assetId',
				name: 'user name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'user/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			const userToUpsert = Object.assign({}, user);
			return userStore.upsertAsync(userToUpsert)
				.then(createdUser => {
					console.log("user created ", createdUser);
					user.should.deep.equal(userToUpsert);
				});
		});

	});

});
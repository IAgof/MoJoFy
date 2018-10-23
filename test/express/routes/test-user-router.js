// test/express/routes/test-user-router.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils')
const request = require('supertest');
const express = require('express');
const expect = require('chai').expect;
const should = require('chai').should();
const testUtil = require('../../test-util');

const userControllerSpy = {
	faked: true,
	list: sinon.stub().returns(Promise.resolve()),
  get: sinon.stub().returns(Promise.resolve()),
  query: sinon.stub().returns(Promise.resolve())
};

const fakeAcl = { middleware: function(req, res, next) { next(); } };

function initMockApp(compositionResponse, entryResponse) {
	const app = express();
	// //fake models to run the Mongoose callbacks
	// var userModel = {
	// 	findByIdAndRemove: function (id, cb) {
	// 		cb(compositionResponse.err, compositionResponse.res);
	// 	}
	// };
	// var entryModel = {
	// 	findOne: function (req, cb) {
	// 		cb(entryResponse.err, entryResponse.res);
	// 	}
	// };
	//proxy models when loading the router

	const router = proxyquire('../../../components/user/network', {
		'./index': userControllerSpy,
		'./acl': fakeAcl
	});
	app.use('/user', router);
	//define error handler
	app.use(function (err, req, res, next) {
		res.status(err.status || 500).json({
			message: err.message,
			error: err
		});
	});
	return app;
}

function initFullApp() {
	const app = express();
  const router = proxyquire('../../../components/user/network', {
    './acl': fakeAcl
  });

  app.use('/user', router);
	//define error handler
	app.use(function (err, req, res, next) {
		res.status(err.status || 500).json({
			message: err.message,
			error: err
		});
	});
	return app;
}

const userStoreCB = require('../../../components/user/store');
const userStore = Bluebird.promisifyAll(userStoreCB, { promisifier: PromisifierUtils.noErrPromisifier });
// const compositionCtrl = require('../../../components/project/composition');

let mockApp = initMockApp({err: null, res: 'mockUser'},
	{err: null, res: 'mockEntry'});

// function removeAllCompositions() {
// 	return testUtil.removeAllEntities('composition');
// }
//
// function removeAllTracks() {
// 	return testUtil.removeAllEntities('track');
// }
//
// function removeAllMedias() {
// 	return testUtil.removeAllEntities('media');
// }

function removeAllUsers() {
	return testUtil.removeAllEntities('user');
}

describe('User router', () => {

	describe('user list GET /', () => {
		// beforeEach(removeAllCompositions);
		// beforeEach(removeAllTracks);
		// beforeEach(removeAllMedias);
		beforeEach(removeAllUsers);

		it('should filter retrieved user list', function (done) {
			const user1 = {
				id: 'userId.1',
				authId: 'authId.1',
				name: 'user1 name',
				username: 'user1 username',
				email: 'user1@email.co',
				password: 'qwerty1',
				verified: false,
				videoCount: 0,
				role: 'guest',
				pic: 'http://user1.pic',
				updated_at: new Date()
			};
			const user2 = {
				id: 'userId.2',
				authId: 'authId2',
				name: 'user2 name',
				username: 'user2 username',
				email: 'user2@email.co',
				password: 'qwerty2',
				verified: false,
				videoCount: 0,
				role: 'guest',
				pic: 'http://user2.pic',
				updated_at: new Date()
			};

			userStore.upsertAsync(user1)
				.then(createdUser => {
					console.log("user created ", createdUser);
					return userStore.upsertAsync(user2);
				})
				.then(createdUser => {
					console.log("user created ", createdUser);
					app = initFullApp();
					request(app)
						.get('/user/')
						.query()
						.expect(200)
						.end((err, res) => {
							console.log(" res body is ", res.body );
							let retrievedUserList = res.body;
							retrievedUserList.should.have.length(2);
							const retrievedUser1 = retrievedUserList.filter(item => item._id === user1.id)[0];
							const retrievedUser2 = retrievedUserList.filter(item => item._id === user2.id)[0];
							retrievedUser1.should.not.have.property('password');
							retrievedUser1.should.not.have.property('authId');
							retrievedUser1.should.not.have.property('email'); // TODO(jliarte): 22/10/18 if acl
							retrievedUser2.should.not.have.property('password');
							retrievedUser2.should.not.have.property('authId');
							retrievedUser2.should.not.have.property('email'); // TODO(jliarte): 22/10/18 if acl
							done();
						});
				})
				.catch(error => done);
		}).timeout(10000);

		xit('should not filter email from retrieved user list if has acl permissions', function (done) {
		});

			// 	it('should propagate orderBy query param', function (done) {
	// 		// let app = initMockApp({err: null, res: 'mockUser'},
	// 		// 	{err: null, res: 'mockEntry'});
	// 		request(mockApp)
	// 			.get('/composition/')
	// 			.query({orderBy: 'modification_date'})
	// 			.expect((res) => {
	// 				sinon.assert.calledOnce(userControllerSpy.query);
	// 				sinon.assert.calledWith(userControllerSpy.query, { composition: {}, orderBy: 'modification_date'});
	// 			})
	// 			.expect(200, done);
	// 	}).timeout(10000);
	//
	// });
	//
	// describe('composition get GET /:compositionId', () => {
	//
	// 	it('should propagate cascade query param', function (done) {
	// 		const compositionId = 'compositionId';
	// 		request(mockApp)
	// 			.get('/composition/' + compositionId)
	// 			.query({cascade: true})
	// 			.expect((res) => {
	// 				console.log("GET /composition/:compositionId result body is ", res.body);
	// 				sinon.assert.calledOnce(userControllerSpy.get);
	// 				sinon.assert.calledWith(userControllerSpy.get, compositionId, 'true', undefined);
	// 			})
	// 			.expect(200, done);
	// 	}).timeout(10000);

	});

	describe('user GET /:userId', () => {
		beforeEach(removeAllUsers);

		it('should filter retrieved user', function (done) {
			const user = {
				id: 'userId.1',
				authId: 'authId.1',
				name: 'user name',
				username: 'user username',
				email: 'user@email.co',
				password: 'qwerty1',
				verified: false,
				videoCount: 0,
				role: 'guest',
				pic: 'http://user.pic',
				updated_at: new Date()
			};

			userStore.upsertAsync(user)
				.then(createdUser => {
					console.log("user created ", createdUser);
					app = initFullApp();
					request(app)
						.get('/user/' + user.id)
						.query()
						.expect(200)
						.end((err, res) => {
							console.log(" res body is ", res.body );
							let retrievedUser = res.body;
							retrievedUser.should.not.have.property('password');
							retrievedUser.should.not.have.property('authId');
							retrievedUser.should.not.have.property('email'); // TODO(jliarte): 22/10/18 if acl
							done();
						});
				})
				.catch(error => done);
		}).timeout(10000);

		xit('should not filter email from retrieved user if has acl permissions', function (done) {
		});

	});


	describe('user GET /exist', () => {
		beforeEach(removeAllUsers);

		it('should return exists if user with same exists', function (done) {
			const user = {
				id: 'userId.1',
				authId: 'authId.1',
				name: 'user name',
				username: 'user username',
				email: 'user@email.co',
				password: 'qwerty1',
				verified: false,
				videoCount: 0,
				role: 'guest',
				pic: 'http://user.pic',
				updated_at: new Date()
			};

			userStore.upsertAsync(user)
				.then(createdUser => {
					console.log("user created ", createdUser);
					app = initFullApp();
					request(app)
						.get('/user/exist')
						.query({email: user.email})
						.expect(200)
						.end((err, res) => {
							console.log(" res body is ", res.body );
							let exists = res.body;
							exists.should.deep.equal({ exist: true });
							done();
						});
				})
				.catch(error => done);
		}).timeout(10000);


		it('should not return exists if user with same email does not exist', function (done) {
			const user = {
				id: 'userId.1',
				authId: 'authId.1',
				name: 'user name',
				username: 'user username',
				email: 'user@email.co',
				password: 'qwerty1',
				verified: false,
				videoCount: 0,
				role: 'guest',
				pic: 'http://user.pic',
				updated_at: new Date()
			};

			userStore.upsertAsync(user)
				.then(createdUser => {
					console.log("user created ", createdUser);
					app = initFullApp();
					request(app)
						.get('/user/exist')
						.query({email: "another@email"})
						.expect(200)
						.end((err, res) => {
							console.log(" res body is ", res.body );
							let exists = res.body;
							exists.should.deep.equal({ exist: false });
							done();
						});
				})
				.catch(error => done);
		}).timeout(10000);

	});

});

// test/components/project/composition/test-composition-router.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const expect = require('chai').expect;

const compositionControllerSpy = {
	faked: true,
	list: sinon.stub().returns(Promise.resolve()),
	get: sinon.stub().returns(Promise.resolve())
};

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

	const router = proxyquire('../../../components/project/composition/network', {
		'./index': compositionControllerSpy
	});
	app.use('/composition', router);
	//define error handler
	app.use(function (err, req, res, next) {
		res.status(err.status || 500).json({
			message: err.message,
			error: err
		});
	});
	return app;
}

let app = initMockApp({err: null, res: 'mockUser'},
	{err: null, res: 'mockEntry'});

describe('Composition router', () => {
	describe('composition list GET /', () => {

		it('should propagate orderBy query param', function (done) {
			// let app = initMockApp({err: null, res: 'mockUser'},
			// 	{err: null, res: 'mockEntry'});
			request(app)
				.get('/composition/')
				.query({orderBy: 'modification_date'})
				.expect((res) => {
					// sinon.assert.notCalled(User.findByIdAndRemove);
					sinon.assert.calledOnce(compositionControllerSpy.list);
					sinon.assert.calledWith(compositionControllerSpy.list, undefined, {orderBy: 'modification_date'});
				})
				.expect(200, done);
		}).timeout(10000);

	});

	describe('composition get GET /:compositionId', () => {

		it('should propagate cascade query param', function (done) {
			const compositionId = 'compositionId';
			request(app)
				.get('/composition/' + compositionId)
				.query({cascade: true})
				.expect((res) => {
					sinon.assert.calledOnce(compositionControllerSpy.get);
					console.error("spy calls ", compositionControllerSpy.get.calls);
					sinon.assert.calledWith(compositionControllerSpy.get, compositionId, 'true', undefined);
				})
				.expect(200, done);
		}).timeout(10000);

	});
});

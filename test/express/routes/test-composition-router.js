// test/express/routes/test-composition-router.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const expect = require('chai').expect;
const should = require('chai').should();
const testUtil = require('../../test-util');

const compositionControllerSpy = {
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

	const router = proxyquire('../../../components/project/composition/network', {
		'./index': compositionControllerSpy,
		'./acl': fakeAcl
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

function initFullApp() {
	const app = express();
  const router = proxyquire('../../../components/project/composition/network', {
    './acl': fakeAcl
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

const assetCtrl = require('../../../components/asset');
const compositionCtrl = require('../../../components/project/composition');

let mockApp = initMockApp({err: null, res: 'mockUser'},
	{err: null, res: 'mockEntry'});

function removeAllCompositions() {
	return testUtil.removeAllEntities('composition');
}

function removeAllTracks() {
	return testUtil.removeAllEntities('track');
}

function removeAllMedias() {
	return testUtil.removeAllEntities('media');
}

function removeAllAssets() {
	return testUtil.removeAllEntities('asset');
}

describe('Composition router', () => {
	describe('composition list GET /', () => {
		beforeEach(removeAllCompositions);
		beforeEach(removeAllTracks);
		beforeEach(removeAllMedias);
		beforeEach(removeAllAssets);


		it('should get all composition details in cascade', function (done) {
			const media1Id = 'mediaId.1';
			const media2Id = 'mediaId.2';
			const asset1 = {
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
				// mediaId: media1Id // FIXME(jliarte): 27/07/18 assetCtrl is failing: TypeError: mediaCtrl.updateMediaAsset is not a function
			};
			const asset2 = {
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
				// mediaId: media2Id // FIXME(jliarte): 27/07/18 assetCtrl is failing: TypeError: mediaCtrl.updateMediaAsset is not a function
			};

			const media1 = {
				id:  media1Id,
				mediaType: 'video',
				position: 0,
				mediaPath: 'media/1/path',
				volume: 0.2,
				remoteTempPath: 'remote/1/path',
				clipText: '',
				clipTextPosition: '',
				hasText: false,
				trimmed: false,
				startTime: 0,
				stopTime: 120980,
				videoError: '',
				transcodeFinished: false,
				// asset: asset1
			};
			const media2 = {
				id:  media2Id,
				mediaType: 'video',
				position: 0,
				mediaPath: 'media/1/path',
				volume: 0.2,
				remoteTempPath: 'remote/1/path',
				clipText: '',
				clipTextPosition: '',
				hasText: false,
				trimmed: false,
				startTime: 0,
				stopTime: 120980,
				videoError: '',
				transcodeFinished: false,
				// asset: asset2
			};

			const track1 = {
				id: 'trackId.1',
				position: 0,
				trackIndex: 1,
				volume: 0.5,
				muted: false,
				medias: [media1, media2]
			};
			const track2 = {
				id: 'trackId.2',
				position: 1,
				trackIndex: 2,
				volume: 0.5,
				muted: true
			};

			const composition = {
				id: 'compositionId',
				title: 'mycomposition',
				description: 'desc',
				remoteProjectPath: 'remote/prj/path',
				quality: 'poor',
				resolution: 'fhd',
				frameRate: '30',
				duration: 42,
				audioFadeTransitionActivated: true,
				videoFadeTransitionActivated: false,
				watermarkActivated: true,
				productType: 'p1,p2',
				poster: 'poster/parh',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
				tracks: [ track1, track2 ]
			};
			assetCtrl.add(asset1)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					media1.assetId = createdAsset._id;
					return assetCtrl.add(asset2);
				})
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					media2.assetId = createdAsset._id;
					return compositionCtrl.add(composition);
				})
				.then(result => new Promise(resolve => setTimeout(() => resolve(result), 2000)))
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionCtrl.get(composition.id);
				})
				.then(retrievedComposition => {
					console.log("retrieved composition is ", retrievedComposition);
					let plainComposition = Object.assign({}, composition);
					delete plainComposition.tracks;
					delete retrievedComposition.modification_date;
					delete retrievedComposition.creation_date;
					retrievedComposition.id = retrievedComposition._id;
					delete retrievedComposition._id;
					retrievedComposition.should.deep.equal(plainComposition);
					app = initFullApp();
					request(app)
						.get('/composition/'+ composition.id)
						.query({cascade: true})
						.expect(200)
						.end((err, res) => {
							console.log(" res body is ", res.body );
							let retrievedComposition = res.body;
							retrievedComposition.should.have.property('tracks');
							retrievedComposition.tracks.should.have.length(2);
							const retrievedTrack1 = retrievedComposition.tracks.filter(item => item._id === track1.id)[0];
							retrievedTrack1.should.have.property('medias');
							retrievedTrack1.medias.should.have.length(2);
							console.log("track medias are ", retrievedTrack1.medias);
							const retrievedTrack1Media1 = retrievedTrack1.medias.filter(item => item._id === media1.id)[0];
							const retrievedTrack1Media2 = retrievedTrack1.medias.filter(item => item._id === media2.id)[0];
							console.log("track media1 ", retrievedTrack1Media1);
							console.log("track media2 ", retrievedTrack1Media2);
							retrievedTrack1Media1.should.have.property('asset');
							retrievedTrack1Media2.should.have.property('asset');
							done();
						});
				});
		}).timeout(10000);

		it('should propagate orderBy query param', function (done) {
			// let app = initMockApp({err: null, res: 'mockUser'},
			// 	{err: null, res: 'mockEntry'});
			request(mockApp)
				.get('/composition/')
				.query({orderBy: 'modification_date'})
				.expect((res) => {
					sinon.assert.calledOnce(compositionControllerSpy.query);
					sinon.assert.calledWith(compositionControllerSpy.query, { composition: {}, orderBy: 'modification_date'});
				})
				.expect(200, done);
		}).timeout(10000);

	});

	describe('composition get GET /:compositionId', () => {

		it('should propagate cascade query param', function (done) {
			const compositionId = 'compositionId';
			request(mockApp)
				.get('/composition/' + compositionId)
				.query({cascade: true})
				.expect((res) => {
					console.log("GET /composition/:compositionId result body is ", res.body);
					sinon.assert.calledOnce(compositionControllerSpy.get);
					sinon.assert.calledWith(compositionControllerSpy.get, compositionId, 'true', undefined);
				})
				.expect(200, done);
		}).timeout(10000);

	});
});

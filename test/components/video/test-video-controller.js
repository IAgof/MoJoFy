// test/components/video/test-video-controller.js

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils')

const videoStoreCB = require('../../../components/video/store');
const videoStore = Bluebird.promisifyAll(videoStoreCB, { promisifier: PromisifierUtils.noErrPromisifier });

const videoStoreSpy = {
	faked: true,
	// get: sinon.spy(),
	// list: sinon.spy(),
	// listDataStore : sinon.spy(),
	// upsert: sinon.spy(),
	remove: sinon.stub().callsArgWith(1, true),
	count: sinon.spy()
};

const userCtrlSpy = {
	decreaseVideoCounter: sinon.spy()
};

const fileUploadSpy = {
	processUploadedVideo: sinon.spy(),
	moveUploadedFile: sinon.spy,
	removeFromCloudStorage: sinon.spy()
};

// TODO(jliarte): 16/07/18 setup in beforeEach?
const videoCtrlCB = proxyquire('../../../components/video', {
	'./store': videoStoreSpy,
	'../user': userCtrlSpy,
	'../file': fileUploadSpy
});
const videoCtrl = Bluebird.promisifyAll(videoCtrlCB, { promisifier: PromisifierUtils.noErrPromisifier });

//Require the dev-dependencies
const assert = require('assert');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();


function removeAllVideos() {
	return videoStore.listDataStoreAsync({})
		.then((videos) => {
			if (videos.length == 0) {
				return Promise.resolve();
			}
			console.log("removing existing videos ", videos.length, videos);
			return Promise.all(videos.map(video => videoStore.removeAsync(video._id))).then(console.log);
		});
}

describe('Video Store', () => {
	describe('remove', () => {
		beforeEach(removeAllVideos);

		it('it should call video store remove', () => {
			let createdVideoId;
			const video = {
				title: 'Video title',
			};
			console.log("calling video store upsert with ", video);

			return videoStore.upsertAsync(video)
				.then(res => {
					createdVideoId = res;
					console.log("video created ", res);
					console.log("calling video remove with ", createdVideoId);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					console.log("retrieved videos are ", videos);
					videos.should.have.length(1);
					createdVideoId = videos[0]._id;
					return videoCtrl.removeAsync(createdVideoId, null);
				})
				.then(res => {
					console.log("video removed called ", res);
					sinon.assert.calledWith(videoStoreSpy.remove, createdVideoId, sinon.match.any);
				});
		});

		it('it should call file removal', () => {
			let createdVideoId;
			const videoUri = 'video/uri';
			const originalUri = 'original/uri';
			const posterUri = 'poster/uri';
			const video = {
				title: 'Video title',
				video: videoUri,
				original: originalUri,
				poster: posterUri
			};
			console.log("calling video store upsert with video ", video);

			return videoStore.upsertAsync(video)
				.then(res => {
					createdVideoId = res;
					console.log("video created ", res);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					console.log("retrieved videos are ", videos);
					videos.should.have.length(1);
					return videoCtrl.removeAsync(videos[0]._id, null);
				})
				.then(removeResult => {
					sinon.assert.calledWith(fileUploadSpy.removeFromCloudStorage, videoUri);
					sinon.assert.calledWith(fileUploadSpy.removeFromCloudStorage, originalUri);
					sinon.assert.calledWith(fileUploadSpy.removeFromCloudStorage, posterUri);
				});
		});

		it('it should decrease video owner video counter', () => {
			let createdVideoId;
			const videoOwner = 42;
			const video = {
				title: 'Video title',
				owner: videoOwner
			};
			console.log("calling video store upsert with ", video);

			return videoStore.upsertAsync(video)
				.then(res => {
					createdVideoId = res;
					console.log("video created ", res);
					console.log("calling video remove with ", createdVideoId);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					console.log("retrieved videos are ", videos);
					videos.should.have.length(1);
					createdVideoId = videos[0]._id;
					return videoCtrl.removeAsync(createdVideoId, null);
				})
				.then(res => {
					console.log("video removed called ", res);
					sinon.assert.called(userCtrlSpy.decreaseVideoCounter);
					sinon.assert.calledWith(userCtrlSpy.decreaseVideoCounter, videoOwner);
				});
		});


	});

});
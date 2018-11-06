// test/components/video/test-video-store.js

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const testUtil = require('../../test-util');

const elasticSpy = {
	faked: true,
	get: sinon.spy(),
	query: sinon.spy(),
	count: sinon.spy(),
	add: sinon.spy(),
	update: sinon.spy(),
	upsert: sinon.spy(),
	remove: sinon.spy()
};

// TODO(jliarte): 16/07/18 setup in beforeEach?
const videoStoreCB = proxyquire('../../../components/video/store', {
  '../../store/elasticsearch': elasticSpy,
  '../../store/fakelasticsearch': elasticSpy
});
const videoStore = Bluebird.promisifyAll(videoStoreCB, { promisifier: PromisifierUtils.noErrPromisifier });


//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllVideos() {
  return testUtil.removeAllEntities('video');
}

before(() => {
  return new Promise(resolve => setTimeout(() => resolve(), 1000)); // TODO(jliarte): 21/09/18 seems that proxyquire or other setup is preventing tests passing when running all together
});

describe('Video Store', () => {
	// describe('upsert', () => {
	// 	beforeEach(removeAllVideos);
	//
	// 	it('it should return video id', () => {
	// 	});
	//
	// });

	describe('remove', () => {
		beforeEach(removeAllVideos);

		it('it should remove a video from store', () => {
			const video = {
				title: 'Video title',
			};
			console.log("calling video store upsert with video ", video);

			return videoStore.upsertAsync(video)
				.then(res => {
					console.log("video created ", res);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					console.log("retrieved videos are ", videos);
					videos.should.have.length(1);
					return videoStore.removeAsync(videos[0]._id);
				})
				.then(removeResult => {
					console.log("video removed result is ", removeResult);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					videos.should.have.length(0);
				});
		});

		it('it should remove a video from elastic', () => {
			let createdVideoId;
			const video = {
				title: 'Video title',
			};
			return videoStore.upsertAsync(video)
				.then(res => {
					createdVideoId = res;
					console.log("video created ", res);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					console.log("retrieved videos are ", videos);
					videos.should.have.length(1);
					createdVideoId = videos[0]._id;
					return videoStore.removeAsync(videos[0]._id);
				})
				.then(removeResult => {
					console.log("video removed result is ", removeResult);
					return videoStore.listDataStoreAsync({});
				})
				.then(videos => {
					videos.should.have.length(0);
          sinon.assert.called(elasticSpy.remove);
					sinon.assert.calledWith(elasticSpy.remove, 'video', createdVideoId, sinon.match.any);
				});
		});

	});

});
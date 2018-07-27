process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const mediaStore = require('../../../../components/project/media/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllMedias() {
	return testUtil.removeAllEntities('media');
}

describe('Media store', () => {
	describe('upsert', () => {
		beforeEach(removeAllMedias);

		it('should create a media', () => {
			const media = {
				id: 'mediaId',
				mediaType: 'video',
				position: 1,
				mediaPath: 'media/path',
				volume: 0.2,
				remoteTempPath: 'remote/tmp',
				clipText: 'hello',
				clipTextPosition: 'up',
				hasText: true,
				trimmed: true,
				startTime: 240,
				stopTime: 8900,
				videoError: 'no error',
				transcodeFinished: true,
				trackId: 'trackId',
				created_by: 'userId'
			};
			return mediaStore.upsert(media)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].id = medias[0]._id;
					delete medias[0]._id;
					delete medias[0].creation_date;
					delete medias[0].modification_date;
					console.log("expected ", media);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(media); // _id
				});
		});

		it('should assign a id if not provided', () => {
			const media = {
				mediaPath: 'media/path',
			};
			return mediaStore.upsert(media)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].should.have.property('_id');
				});
		});

		it('should set creation and modification date on a new media', () => {
			const media = {
				mediaPath: 'media/path',
			};
			return mediaStore.upsert(media)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					delete medias[0]._id;
					medias[0].should.have.property("creation_date");
					medias[0].should.have.property("modification_date");
				});
		});

	});

	describe('query', () => {
		beforeEach(removeAllMedias);

		it('should get media with specified trackId', () => {
			const media = {
				id: 'mediaId',
				mediaType: 'video',
				position: 1,
				mediaPath: 'media/path',
				volume: 0.2,
				remoteTempPath: 'remote/tmp',
				clipText: 'hello',
				clipTextPosition: 'up',
				hasText: true,
				trimmed: true,
				startTime: 240,
				stopTime: 8900,
				videoError: 'no error',
				transcodeFinished: true,
				trackId: 'trackId',
				created_by: 'userId'
			};
			return mediaStore.upsert(media)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.query({ media: { trackId: createdMedia.trackId } });
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].id = medias[0]._id;
					delete medias[0]._id;
					delete medias[0].creation_date;
					delete medias[0].modification_date;
					console.log("expected ", media);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(media); // _id
				});
		});

	});

});
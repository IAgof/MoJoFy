process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const mediaStore = require('../../../../components/project/media/store');
const mediaCtrl = require('../../../../components/project/media');
const config = require('../../../../config');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllMedias() {
	return testUtil.removeAllEntities('media');
}

describe('Media controller', () => {
	describe('add', () => {
		beforeEach(removeAllMedias);

		it('it should create a media', () => {
			const media = {
				// id: 'mediaId',
				uuid: 'mediaId',
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
			return mediaCtrl.add(media)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						medias[0].id = medias[0]._id;
					}
					delete media.id;
					delete medias[0]._id;
					delete medias[0].creation_date;
					delete medias[0].modification_date;
					console.log("expected ", media);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(media); // _id
				});
		});

		it('it should assign a id if not present', () => {
			const media = {
			};
			return mediaCtrl.add(media)
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

		it('it should assign a user if present', () => {
			const media = {
			};
			const user = { _id: 'userId' };
			return mediaCtrl.add(media, user)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].should.have.property('created_by');
					medias[0]['created_by'].should.equal(user._id);
				});
		});

		it('it should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const media = {
			};
			return mediaCtrl.add(media)
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].should.not.have.property('created_by');
				});
		});

		it('it should return created media', () => {
			let createdMedia;
			const media = {
				id: 'mediaId',
				uuid: 'mediaId',
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
			return mediaCtrl.add(media)
				.then(result => {
					console.log("media created ", result);
					createdMedia = result;
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						medias[0].id = medias[0]._id;
					}
					delete medias[0].creation_date;
					delete medias[0].modification_date;
					console.log("expected ", createdMedia);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(createdMedia); // _id
				});
		});

	});

});
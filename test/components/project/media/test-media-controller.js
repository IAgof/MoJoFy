process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const assetControllerSpy = {
	faked: true,
	remove: sinon.stub().returns(Promise.resolve())
};

const mediaStore = require('../../../../components/project/media/store');
const mediaCtrl = proxyquire('../../../../components/project/media', {
	'../../asset': assetControllerSpy
});
const assetStore = require('../../../../components/asset/store');

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
				assetId: 'assetId',
				created_by: 'userId'
			};
			return mediaCtrl.add(media)
				.then(createdMediaId => {
					console.log("media created id ", createdMediaId);
					return mediaCtrl.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(medias[0]);
					console.log("expected ", media);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(media); // _id
				});
		});

		it('should assign a id if not present', () => {
			const media = {};
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

		it('should assign a user if present', () => {
			const media = {};
			const user = {_id: 'userId'};
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

		it('should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const media = {};
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

		it('should return created media', () => {
			let createdMedia;
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
				assetId: 'assetId',
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
					delete medias[0].creation_date;
					delete medias[0].modification_date;
					console.log("expected ", createdMedia);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(createdMedia); // _id
				});
		});

	});

	describe('updateMediaAsset', () => {
		beforeEach(removeAllMedias);

		it('should set assetId for existing media with empty assetId', () => {
			let createdMedia;
			const assetId = 'assetId';
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
				assetId: '',
				created_by: 'userId'
			};
			return mediaCtrl.add(media)
				.then(result => {
					console.log("media created ", result);
					createdMedia = result;
					return mediaCtrl.updateMediaAsset(createdMedia._id, assetId);
				})
				.then(value => {
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].assetId.should.equal(assetId);
				});
		});

		it('should update assetId for existing media with assigned assetId and remove old asset', () => {
			let createdMedia;
			const assetId = 'assetId';
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
				assetId: 'otherAssetId',
				created_by: 'userId'
			};
			return mediaCtrl.add(media)
				.then(result => {
					console.log("media created ", result);
					createdMedia = result;
					return mediaCtrl.updateMediaAsset(createdMedia._id, assetId);
				})
				.then(value => {
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].assetId.should.equal(assetId);
					sinon.assert.called(assetControllerSpy.remove);
					sinon.assert.calledWith(assetControllerSpy.remove, media.assetId);
				});
		});

		it('should not remove old asset if its the same as old one', () => {
			assetControllerSpy.remove.resetHistory();
			let createdMedia;
			const assetId = 'sameAssetId';
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
				assetId: 'sameAssetId',
				created_by: 'userId'
			};
			return mediaCtrl.add(media)
				.then(result => {
					console.log("media created ", result);
					createdMedia = result;
					return mediaCtrl.updateMediaAsset(createdMedia._id, assetId);
				})
				.then(value => {
					return mediaStore.list();
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					medias[0].assetId.should.equal(assetId);
					sinon.assert.notCalled(assetControllerSpy.remove);
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
				assetId: 'assetId',
				created_by: 'userId'
			};
			return mediaCtrl.add(media)
				.then(createdMediaId => {
					console.log("media created id ", createdMediaId);
					return mediaCtrl.query({media: {trackId: media.trackId}});
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(medias[0]);
					console.log("expected ", media);
					console.log("actual", medias[0]);
					medias[0].should.deep.equal(media);
					return mediaCtrl.query({media: {trackId: "notFound"}});
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(0);
				});
		});

		it('should get media with specified trackId and corresponding asset if cascade', () => {
			const asset = {
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
			};
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
				created_by: 'userId',
			};
			return assetStore.add(asset)
				.then(createdAssetId => {
					console.log("created asset id ", createdAssetId);
					media.assetId = createdAssetId;
					return mediaCtrl.add(media)
				})
				.then(createdMedia => {
					console.log("media created ", createdMedia);
					return mediaCtrl.query({media: {trackId: media.trackId}, cascade: true});
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(1);

					medias[0].should.have.property('asset');
					testUtil.prepareRetrievedEntityToCompare(medias[0].asset);
					delete medias[0].asset.id;
					medias[0].asset.should.deep.equal(asset);
					return mediaCtrl.query({media: {trackId: "notFound"}});
				})
				.then(medias => {
					console.log("retrieved medias are ", medias);
					medias.should.have.length(0);
				});
		});

	});

	describe('remove', () => {
		beforeEach(removeAllMedias);

		it('should remove specified media', () => {
			const media1 = {
				id: 'mediaId',
			};
			const media2 = {
				id: 'mediaId.2',
			};
			return mediaStore.add(media1)
				.then(createdMediaId => {
					console.log("created media id ", createdMediaId);
					return mediaStore.add(media2)
				})
				.then(createdMediaId => {
					console.log("created media id ", createdMediaId);
					return mediaCtrl.remove(media1.id);
				})
				.then(result => {
					console.log("result removing media ", result);
					return mediaStore.list();
				})
				.then(medias => {
					medias.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(medias[0]);
					medias[0].should.deep.equal(media2)
				});
		});

	});

	describe('removeMulti', () => {
		beforeEach(removeAllMedias);

		it('should remove specified medias', () => {
			const media1 = {
				id: 'mediaId',
			};
			const media2 = {
				id: 'mediaId.2',
			};
			return mediaStore.add(media1)
				.then(createdMediaId => {
					console.log("created media id ", createdMediaId);
					return mediaStore.add(media2)
				})
				.then(createdMediaId => {
					console.log("created media id ", createdMediaId);
					return mediaCtrl.removeMulti([media1.id, media2.id]);
				})
				.then(result => {
					console.log("result removing media ", result);
					return mediaStore.list();
				})
				.then(medias => {
					medias.should.have.length(0);
				});
		});

	});

});

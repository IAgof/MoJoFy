// test/components/asset/test-asset-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const mediaControllerSpy = {
	faked: true,
	// remove: sinon.stub().callsArgWith(1, true),
	updateMediaAsset: sinon.stub().returns(Promise.resolve())
};

const assetStore = require('../../../components/asset/store');
const assetCtrl = proxyquire('../../../components/asset', {
	'../project/media': mediaControllerSpy
});

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllAssets() {
	return testUtil.removeAllEntities('asset');
}

describe('Asset controller', () => {
	describe('add', () => {
		beforeEach(removeAllAssets);

		it('should create an asset', () => {
			const asset = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return assetCtrl.add(asset)
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(assets[0]);
					console.log("expected ", asset);
					console.log("actual", assets[0]);
					assets[0].should.deep.equal(asset); // _id
				});
		});

		it('should assign a id if not present', () => {
			const asset = {};
			return assetCtrl.add(asset)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					assets[0].should.have.property('_id');
				});
		});

		it('should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const asset = {};
			return assetCtrl.add(asset)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					assets[0].should.not.have.property('created_by');
				});
		});

		it('should return created asset', () => {
			let createdAsset;
			const asset = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return assetCtrl.add(asset)
				.then(result => {
					console.log("asset created ", result);
					createdAsset = result;
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					delete assets[0].creation_date;
					delete assets[0].modification_date;
					console.log("expected ", createdAsset);
					console.log("actual", assets[0]);
					assets[0].should.deep.equal(createdAsset);
				});
		});

		it('should update media asset to existing media', () => {
			let createdAssetId;
			const mediaId = 'mediaId';
			const asset = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId',
				mediaId: mediaId
			};
			return assetCtrl.add(asset)
				.then(result => {
					console.log("asset created ", result);
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					createdAssetId = assets[0]._id;
					sinon.assert.called(mediaControllerSpy.updateMediaAsset);
					sinon.assert.calledWith(mediaControllerSpy.updateMediaAsset, mediaId, createdAssetId);
				});
		});
	});

	describe('remove', () => {
		beforeEach(removeAllAssets);
		// beforeEach(removeAllAssets.bind(null)); // TODO(jliarte): 25/07/18 don't know why error happens: TypeError: Cannot read property 'call' of undefined

		it('should remove existing asset', () => {
			const asset1 = {
				id: 'assetId1',
			};
			const asset2 = {
				id: 'assetId2',
			};
			return assetCtrl.add(asset1)
				.then(result => {
					console.log("asset created ", result);
					return assetCtrl.add(asset2);
				})
				.then(result => {
					console.log("asset created ", result);
					return assetCtrl.remove(asset1.id);
				})
				.then(removedAsset => {
					removedAsset._id.should.equal(asset1.id);
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					assets[0]._id.should.equal(asset2.id);
				});
		});

	});

	describe('get', () => {
		beforeEach(removeAllAssets);

		it('should return specified asset by id', () => {
			const asset = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return assetCtrl.add(asset)
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.get(createdAsset._id);
				})
				.then(retrievedAsset => {
					console.log("retrieved asset is ", retrievedAsset);
					testUtil.prepareRetrievedEntityToCompare(retrievedAsset);
					retrievedAsset.should.deep.equal(asset);
				});
		});

	});

	describe('query', () => {
		beforeEach(removeAllAssets);

		it('should return specified asset by hash', () => {
			const asset1 = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			const asset2 = {
				id: 'assetId.2',
				name: 'asset2 name',
				type: 'video2',
				hash: 'dopiufhasdhkfhdsñkgagdsags',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset2/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'user2Id'
			};
			return assetCtrl.add(asset1)
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.add(asset2);
				})
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.query({ asset: {hash: asset1.hash} });
				})
				.then(retrievedAssets => {
					console.log("retrieved assets are  ", retrievedAssets);
					retrievedAssets.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedAssets[0]);
					retrievedAssets[0].should.deep.equal(asset1);
				});
		});

		it('should return specified asset by userId', () => {
			const asset1 = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			const asset2 = {
				id: 'assetId.2',
				name: 'asset2 name',
				type: 'video2',
				hash: 'dopiufhasdhkfhdsñkgagdsags',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset2/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'user2Id'
			};
			return assetCtrl.add(asset1)
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.add(asset2);
				})
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.query({ asset: {created_by: asset1.created_by} });
				})
				.then(retrievedAssets => {
					console.log("retrieved assets are  ", retrievedAssets);
					retrievedAssets.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedAssets[0]);
					retrievedAssets[0].should.deep.equal(asset1);
				});
		});

		it('should return specified asset by hash and userId', () => {
			const asset1 = {
				id: 'assetId',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			const asset2 = {
				id: 'assetId.2',
				name: 'asset2 name',
				type: 'video2',
				hash: 'dopiufhasdhkfhdsñkgagdsags',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset2/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'user2Id'
			};
			const asset3 = {
				id: 'assetId.3',
				name: 'asset name',
				type: 'video',
				hash: 'sahflkdsagflkjdsafglkudsafdsa',
				filename: 'file.name',
				mimetype: 'mime/type',
				uri: 'asset/uuri',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId3'
			};
			return assetCtrl.add(asset1)
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.add(asset2);
				})
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.add(asset3);
				})
				.then(createdAsset => {
					console.log("asset created id ", createdAsset);
					return assetCtrl.query({ asset: {hash: asset1.hash, created_by: asset1.created_by} });
				})
				.then(retrievedAssets => {
					console.log("retrieved assets are  ", retrievedAssets);
					retrievedAssets.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedAssets[0]);
					retrievedAssets[0].should.deep.equal(asset1);
				});
		});

	});


});
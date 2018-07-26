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
		beforeEach(removeAllAssets.bind(null)); // TODO(jliarte): 25/07/18 don't know why error happens: TypeError: Cannot read property 'call' of undefined

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
					assets[0].id = assets[0]._id;
					delete assets[0]._id;
					delete assets[0].creation_date;
					delete assets[0].modification_date;
					console.log("expected ", asset);
					console.log("actual", assets[0]);
					assets[0].should.deep.equal(asset); // _id
				});
		});

		it('should assign a id if not present', () => {
			const asset = {
			};
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

		it('should assign a user if present', () => {
			const asset = {
			};
			const user = { _id: 'userId' };
			return assetCtrl.add(asset, user)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					assets[0].should.have.property('created_by');
					assets[0]['created_by'].should.equal(user._id);
				});
		});

		it('should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const asset = {
			};
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
});
// test/components/asset/test-asset-store.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const assetStore = require('../../../components/asset/store');

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllAssets() {
	return testUtil.removeAllEntities('asset');
}

describe('Asset store', () => {
	describe('upsert', () => {
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
            return assetStore.upsert(asset)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					return assetStore.list();
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

		it('should assign an id if not provided', () => {
			const asset = {
				name: 'asset name',
			};
			return assetStore.upsert(asset)
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

		it('should set creation and modification date on a new asset', () => {
			const asset = {
				name: 'asset name',
			};
			return assetStore.upsert(asset)
				.then(createdAsset => {
					console.log("asset created ", createdAsset);
					return assetStore.list();
				})
				.then(assets => {
					console.log("retrieved assets are ", assets);
					assets.should.have.length(1);
					delete assets[0]._id;
					assets[0].should.have.property("creation_date");
					assets[0].should.have.property("modification_date");
				});
		});

	});

});
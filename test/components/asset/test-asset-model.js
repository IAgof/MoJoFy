// test/components/asset/test-asset-model.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Asset = require('../../../components/asset/model');

const testUtil = require('../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllAssets() {
	return testUtil.removeAllEntities('asset');
}

describe('Asset model', () => {
	describe('set', () => {
		beforeEach(removeAllAssets);

		it('should set default values for empty fields', () => {
			const asset = {
			};
			modelatedAsset = Asset.set(asset);
			modelatedAsset.should.deep.equal(Asset._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});
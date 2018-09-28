// test/components/billing/purchase/test-purchase-model.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Purchase = require('../../../../components/billing/purchase/model');

const testUtil = require('../../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

describe('Purchase model', () => {
	describe('set', () => {

		it('it should set default values for empty fields', () => {
			const purchase = {
			};
			let modelatedPurchase = Purchase.set(purchase);
			modelatedPurchase.should.deep.equal(Purchase._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});

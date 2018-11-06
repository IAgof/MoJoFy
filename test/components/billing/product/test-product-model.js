// test/components/billing/product/test-product-model.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Product = require('../../../../components/billing/product/model');

const testUtil = require('../../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

describe('Product model', () => {
	describe('set', () => {

		it('it should set default values for empty fields', () => {
			const purchase = {
			};
			let modelatedPurchase = Product.set(purchase);
			modelatedPurchase.should.deep.equal(Product._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});

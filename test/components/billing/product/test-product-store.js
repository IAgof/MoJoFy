// test/components/billing/product/test-product-store.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const productStore = require('../../../../components/billing/product/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllProducts() {
	return testUtil.removeAllEntities('product');
}

describe('Product store', () => {
	describe('upsert', () => {
		beforeEach(removeAllProducts);

		it('should create a product', () => {
			const product = {
				id: 'hero',
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84.99,
				yearlyPrice: 112.25,
        discount: 0,
				valueOrder: 3,
      };
			return productStore.upsert(product)
				.then(createdProduct => {
					console.log("product created ", createdProduct);
					return productStore.list();
				})
				.then(products => {
					console.log("retrieved products are ", products);
					products.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(products[0]);
					console.log("expected ", product);
					console.log("actual", products[0]);
					products[0].should.deep.equal(product);
				});
		});

		it('should fail if id not provided', () => {
      const product = {
        productName: 'hero',
      };
			return productStore.upsert(product).should.be.rejectedWith("Cannot upsert product without id");
		});

	});

});
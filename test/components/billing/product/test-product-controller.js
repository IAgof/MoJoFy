// test/components/billing/product/test-product-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const productStore = require('../../../../components/billing/product/store');
const productCtrl = require('../../../../components/billing/product');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllProducts() {
	return testUtil.removeAllEntities('product');
}

describe('Product controller', () => {
	describe('add', () => {
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
      return productCtrl.add(product)
				.then(res => {
					console.log("res creating product ", res);
					return productCtrl.list();
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

		it('should fail if id not present', () => {
			const product = {};
			return productCtrl.add(product).should.be.rejectedWith("Cannot upsert product without id");
		});

		it('should return created product', () => {
			let createdProduct;
      const product = {
	      id: 'hero',
	      productName: 'Hero',
	      description: 'Hero saas product',
	      monthlyPrice: 84.99,
	      yearlyPrice: 112.25,
	      discount: 0,
	      valueOrder: 3,
      };
      return productCtrl.add(product)
				.then(result => {
					console.log("product created ", result);
					createdProduct = result;
					return productStore.list();
				})
				.then(products => {
					console.log("retrieved products are ", products);
					products.should.have.length(1);
					delete products[0].creation_date;
					delete products[0].modification_date;
					console.log("expected ", createdProduct);
					console.log("actual", products[0]);
					products[0].should.deep.equal(createdProduct);
				});
		});

	});

  describe('get', () => {
    beforeEach(removeAllProducts);
    it('should return existing product', () => {
      let createdPurchase;
      const product = {
	      id: 'hero',
	      productName: 'Hero',
	      description: 'Hero saas product',
	      monthlyPrice: 84.99,
	      yearlyPrice: 112.25,
	      discount: 0,
	      valueOrder: 3,
      };
      return productCtrl.add(product)
        .then(result => {
          console.log("product created ", result);
          createdPurchase = result;
          return productCtrl.get(product.id);
        })
        .then(retrievedProduct => {
        	console.log("Retrieved product is ", retrievedProduct);
          testUtil.prepareRetrievedEntityToCompare(retrievedProduct);
          retrievedProduct.should.deep.equal(product);
        });
    });
  });

	describe('list', () => {
		beforeEach(removeAllProducts);

		it('should return all products', () => {
			const product1 = {
				id: 'hero',
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84.99,
				yearlyPrice: 112.25,
				discount: 0,
				valueOrder: 3,
			};
			const product2 = {
				id: 'free',
				productName: 'Free',
				description: 'Free saas product',
				monthlyPrice: 0,
				yearlyPrice: 0,
				discount: 0,
				valueOrder: 0,
			};
			return productStore.add(product1)
				.then(res => {
					console.log("created product ", res);
					return productStore.add(product2)
				})
				.then(res => {
					console.log("created product id ", res);
					return productCtrl.list();
				})
				.then(result => {
					console.log("result removing purchase ", result);
					return productStore.list();
				})
				.then(products => {
					products.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(products[0]);
					testUtil.prepareRetrievedEntityToCompare(products[1]);
					products.should.deep.include(product1);
					products.should.deep.include(product2);
				});
		});

  });

});

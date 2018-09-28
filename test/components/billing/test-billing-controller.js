// test/components/billing/test-billing-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const billingCtrl = require('../../../components/billing');
const purchaseStore = require('../../../components/billing/purchase/store');

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllPurchases() {
	return testUtil.removeAllEntities('purchase');
}

describe('Billing controller', () => {

	describe('givePromotionProductToUserForAYear', () => {
		beforeEach(removeAllPurchases);

		it('should create a product purchase for that user', () => {
      const productId = 'hero';
      const promotionName = 'promotionName';
      const user = {
				_id: 'userId'
			};
      return billingCtrl.givePromotionProductToUserForAYear(user, productId, promotionName)
	      .then(result => {
					console.log("give product result ", result);
					return purchaseStore.list();
				})
	      .then(retrievedPurchases => {
	      	retrievedPurchases.should.have.length(1);
	      	retrievedPurchases[0].userId.should.equal(user._id);
          retrievedPurchases[0].productId.should.equal(productId);
          retrievedPurchases[0].paymentMethod.should.equal(promotionName);
          retrievedPurchases[0].value.should.equal(0);
          const today = new Date();
          const purchaseDate = new Date(retrievedPurchases[0].purchaseDate);
          purchaseDate.getFullYear().should.equal(today.getFullYear());
          purchaseDate.getMonth().should.equal(today.getMonth());
          purchaseDate.getDate().should.equal(today.getDate());
          const expirationDate = new Date(retrievedPurchases[0].expirationDate);
          expirationDate.getFullYear().should.equal(today.getFullYear() + 1);
          expirationDate.getMonth().should.equal(today.getMonth());
          expirationDate.getDate().should.equal(today.getDate());
        })
		});

	});

});
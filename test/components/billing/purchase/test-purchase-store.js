process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const purchaseStore = require('../../../../components/billing/purchase/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllPurchases() {
	return testUtil.removeAllEntities('purchase');
}

describe('Purchase store', () => {
	describe('upsert', () => {
		beforeEach(removeAllPurchases);

		it('should create a purchase', () => {
			const purchase = {
				id: 'purchaseId',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: Date.now(),
        expirationDate: Date.now(),
        paymentMethod: 'promotion',
        value: 14.99,
      };
			return purchaseStore.upsert(purchase)
				.then(createdPurchase => {
					console.log("purchase created ", createdPurchase);
					return purchaseStore.list();
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(purchases[0]);
					console.log("expected ", purchase);
					console.log("actual", purchases[0]);
					purchases[0].should.deep.equal(purchase);
				});
		});

		it('should assign a id if not provided', () => {
      const purchase = {
        productId: 'hero',
      };
			return purchaseStore.upsert(purchase)
				.then(createdPurchase => {
					console.log("purchase created ", createdPurchase);
					return purchaseStore.list();
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(1);
					purchases[0].should.have.property('_id');
				});
		});

	});

	describe('query', () => {
		beforeEach(removeAllPurchases);

    it('should get purchase with specified userId', () => {
      const purchase = {
        id: 'purchaseId1',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: Date.now(),
        expirationDate: Date.now(),
        paymentMethod: 'promotion',
        value: 14.99,
      };
      const anotherPurchase = {
        id: 'purchaseId2',
        userId: 'other-userId',
        productId: 'hero',
        purchaseDate: Date.now(),
        expirationDate: Date.now(),
        paymentMethod: 'promotion',
        value: 14.99,
      };

      return purchaseStore.upsert(purchase)
        .then(createdPurchase => {
          console.log("purchase 1 created ", createdPurchase);
          return purchaseStore.upsert(anotherPurchase);
        })
        .then(createdPurchase => {
          console.log("purchase 2 created ", createdPurchase);
          return purchaseStore.query({ purchase: { userId: purchase.userId } });
        })
        .then(purchases => {
          console.log("retrieved purchases are ", purchases);
          purchases.should.have.length(1);
          testUtil.prepareRetrievedEntityToCompare(purchases[0]);
          purchases[0].should.deep.equal(purchase);
        });
    });

		it('should get purchase with specified productId', () => {
      const purchase = {
        id: 'purchaseId1',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: Date.now(),
        expirationDate: Date.now(),
        paymentMethod: 'promotion',
        value: 3.99,
      };
      const purchase2 = {
        id: 'purchaseId2',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: Date.now(),
        expirationDate: Date.now(),
        paymentMethod: 'promotion',
        value: 14.99,
      };
      return purchaseStore.upsert(purchase)
				.then(createdPurchase => {
					console.log("purchase created ", createdPurchase);
					return purchaseStore.query({ purchase: { productId: purchase.productId } });
        })
        .then(createdPurchase => {
          console.log("purchase 2 created ", createdPurchase);
          return purchaseStore.query({ purchase: { userId: purchase.userId } });
        })
        .then(purchases => {
          purchases.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(purchases[0]);
					console.log("expected ", purchase);
					console.log("actual", purchases[0]);
					purchases[0].should.deep.equal(purchase);
				});
		});

	});

});
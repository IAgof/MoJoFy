// test/components/billing/purchase/test-purchase-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const purchaseStore = require('../../../../components/billing/purchase/store');
const purchaseCtrl = require('../../../../components/billing/purchase');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllPurchases() {
	return testUtil.removeAllEntities('purchase');
}

describe('Purchase controller', () => {
	describe('add', () => {
		beforeEach(removeAllPurchases);

		it('should create a purchase', () => {
      const purchase = {
        id: 'purchaseId',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: new Date('2018/09/25 00:00 UTC'),
        expirationDate: new Date('2019/09/25'),
        paymentMethod: 'promotion',
        value: 14.99,
      };
      return purchaseCtrl.add(purchase)
				.then(res => {
					console.log("res creating purchase ", res);
					return purchaseCtrl.list();
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

		it('should assign a id if not present', () => {
			const purchase = {};
			return purchaseCtrl.add(purchase)
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

		it('should return created purchase', () => {
			let createdPurchase;
      const purchase = {
        id: 'purchaseId',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: new Date('2018/09/25 00:00 UTC'),
        expirationDate: new Date('2019/09/25'),
        paymentMethod: 'promotion',
        value: 14.99,
      };
      return purchaseCtrl.add(purchase)
				.then(result => {
					console.log("purchase created ", result);
					createdPurchase = result;
					return purchaseStore.list();
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(1);
					delete purchases[0].creation_date;
					delete purchases[0].modification_date;
					console.log("expected ", createdPurchase);
					console.log("actual", purchases[0]);
					purchases[0].should.deep.equal(createdPurchase);
				});
		});

	});

  describe('get', () => {
    beforeEach(removeAllPurchases);
    it('should return existing purchase', () => {
      let createdPurchase;
      const purchase = {
        id: 'purchaseId',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: new Date('2018/09/25 00:00 UTC'),
        expirationDate: new Date('2019/09/25'),
        paymentMethod: 'promotion',
        value: 14.99,
      };
      return purchaseCtrl.add(purchase)
        .then(result => {
          console.log("purchase created ", result);
          createdPurchase = result;
          return purchaseCtrl.get(purchase.id);
        })
        .then(retrievedPurchase => {
          testUtil.prepareRetrievedEntityToCompare(retrievedPurchase);
          retrievedPurchase.should.deep.equal(purchase);
        });
    });
  });

	describe('query', () => {
		beforeEach(removeAllPurchases);

		it('should get purchase with specified productId', () => {
      const purchase = {
        id: 'purchaseId',
        userId: 'userId',
        productId: 'hero',
        purchaseDate: new Date('2018/09/25 00:00 UTC'),
        expirationDate: new Date('2019/09/25'),
        paymentMethod: 'promotion',
        value: 14.99,
      };
      const purchase2 = {
        id: 'purchaseId2',
        userId: 'userId',
        productId: 'free',
        purchaseDate: new Date('2018/09/25 00:00 UTC'),
        expirationDate: new Date('2019/09/25'),
        paymentMethod: 'promotion',
        value: 0,
      };
			return purchaseCtrl.add(purchase)
				.then(res => {
          console.log("created purchase 1 ", res);
          return purchaseCtrl.add(purchase);
        })
				.then(res => {
          console.log("created purchase 2 ", res);
          return purchaseCtrl.query( { purchase: { productId: purchase.productId } } );
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(purchases[0]);
					purchases[0].should.deep.equal(purchase);
					return purchaseCtrl.query( { purchase: { productId: "notFound" } } );
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(0);
				});
		});

	});

	describe('remove', () => { // TODO(jliarte): 27/09/18 we'll not remove purchases (i think) so maybe this method is not needed?
		beforeEach(removeAllPurchases);

		it('should remove specified purchase', () => {
			const purchase1 = {
				id: 'purchaseId',
			};
			const purchase2 = {
				id: 'purchaseId.2',
			};
			return purchaseStore.add(purchase1)
				.then(res => {
					console.log("created purchase ", res);
					return purchaseStore.add(purchase2)
				})
				.then(res => {
					console.log("created purchase id ", res);
					return purchaseCtrl.remove(purchase1.id);
				})
				.then(result => {
					console.log("result removing purchase ", result);
					return purchaseStore.list();
				})
				.then(purchases => {
					purchases.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(purchases[0]);
					purchases[0].should.deep.equal(purchase2)
				});
		});

    it('should return removed purchase', () => {
      const purchase1 = {
        id: 'purchaseId',
      };
      const purchase2 = {
        id: 'purchaseId.2',
      };
      return purchaseStore.add(purchase1)
        .then(res => {
          console.log("created purchase id ", res);
          return purchaseStore.add(purchase2)
        })
        .then(res => {
          console.log("created purchase id ", res);
          return purchaseCtrl.remove(purchase1.id);
        })
        .then(result => {
          console.log("result removing purchase ", result);
          testUtil.prepareRetrievedEntityToCompare(result);
          result.should.deep.equal(purchase1);
        });
    });


  });

});

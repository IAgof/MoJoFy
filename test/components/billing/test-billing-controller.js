// test/components/billing/test-billing-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const proxyquire = require('proxyquire');
const sinon = require('sinon');

let featureQueryResults = [
	{ _id: 'feature1', enabled: true },
	{ _id: 'feature2', enabled: false }
];

let featureControllerSpy = {
	faked: true,
	setPlanDefaultsToUser: sinon.stub().returns(Promise.resolve([])),
	query: sinon.stub().returns(Promise.resolve(featureQueryResults))
};

const billingCtrl = proxyquire('../../../components/billing', {
	'../user/user-feature': featureControllerSpy
});
const purchaseStore = require('../../../components/billing/purchase/store');
const productStore = require('../../../components/billing/product');

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
		afterEach(() => { featureControllerSpy.setPlanDefaultsToUser.resetHistory(); });

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
				});
		});

		it('should assign product features for that user', () => {
			const productId = 'hero';
			const promotionName = 'promotionName';
			const user = {
				_id: 'userId'
			};
			return billingCtrl.givePromotionProductToUserForAYear(user, productId, promotionName)
				.then(result => {
					console.log("give product result ", result);
					sinon.assert.called(featureControllerSpy.setPlanDefaultsToUser);
					sinon.assert.calledWith(featureControllerSpy.setPlanDefaultsToUser, user._id, productId);
				});
		});

		it('should not assign product features for that user if has a purchase of higher value', () => {
			const productId = 'hero';
			const promotionName = 'promotionName';
			const user = {
				_id: 'userId'
			};
			const productHero = {
				id: 'hero',
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84.99,
				yearlyPrice: 112.25,
				discount: 3,
				valueOrder: 3,
			};
			const productSuperHero = {
				id: 'superHero',
				productName: 'Super Hero',
				description: 'Super Hero saas product',
				monthlyPrice: 0,
				yearlyPrice: 0,
				discount: 0,
				valueOrder: 4,
			};
			const purchase = {
				userId: user._id,
				productId: productSuperHero.id,
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(), // today
				paymentMethod: 'paypal',
				value: 200,
			};
			purchase.expirationDate.setFullYear(purchase.expirationDate.getFullYear() + 1); // purchase expires next year
			return productStore.upsert(productHero)
				.then(res => {
					console.log("Product 1 upsert ", res);
					return productStore.upsert(productSuperHero);
				})
				.then(res => {
					console.log("Product 2 upsert ", res);
					return purchaseStore.upsert(purchase);
				})
				.then(res => {
					console.log("purchase upsert ", res);
					return billingCtrl.givePromotionProductToUserForAYear(user, productId, promotionName);
				})
				.then(result => {
					console.log("give product result ", result);
					sinon.assert.notCalled(featureControllerSpy.setPlanDefaultsToUser);
					// sinon.assert.calledWith(featureControllerSpy.setPlanDefaultsToUser, user._id, productId);
				});
		});

		it('should assign product features for that user if has a purchase of higher value but has expired', () => {
			const productId = 'hero';
			const promotionName = 'promotionName';
			const user = {
				_id: 'userId'
			};
			const productHero = {
				id: 'hero',
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84.99,
				yearlyPrice: 112.25,
				discount: 3,
				valueOrder: 3,
			};
			const productSuperHero = {
				id: 'superHero',
				productName: 'Super Hero',
				description: 'Super Hero saas product',
				monthlyPrice: 0,
				yearlyPrice: 0,
				discount: 0,
				valueOrder: 4,
			};
			const purchase = {
				userId: user._id,
				productId: productSuperHero.id,
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(), // today
				paymentMethod: 'paypal',
				value: 200,
			};
			purchase.expirationDate.setFullYear(purchase.expirationDate.getFullYear() - 1); // purchase expired last year
			return productStore.upsert(productHero)
				.then(res => {
					console.log("Product 1 upsert ", res);
					return productStore.upsert(productSuperHero);
				})
				.then(res => {
					console.log("Product 2 upsert ", res);
					return purchaseStore.upsert(purchase);
				})
				.then(res => {
					console.log("purchase upsert ", res);
					return billingCtrl.givePromotionProductToUserForAYear(user, productId, promotionName);
				})
				.then(result => {
					console.log("give product result ", result);
					sinon.assert.called(featureControllerSpy.setPlanDefaultsToUser);
					sinon.assert.calledWith(featureControllerSpy.setPlanDefaultsToUser, user._id, productId);
				});
		});


	});

	describe('getActiveUserPuchasesByProductValueOrder', () => {
		beforeEach(removeAllPurchases);
		
		it('should return user purchases with associated product valueOrder ordered by it descending for that user', () => {
			let userId = 'userId';
			const user = { _id: userId };
			const purchase = {
				id: 'purchaseId',
				userId: userId,
				productId: 'hero',
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 14.99,
			};
			purchase.expirationDate.setFullYear(purchase.expirationDate.getFullYear() + 1); // purchase expires next year
			const purchase2 = {
				id: 'purchaseId2',
				userId: userId,
				productId: 'free',
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 0,
			};
			purchase2.expirationDate.setFullYear(purchase2.expirationDate.getFullYear() + 1); // purchase expires next year
			const product1 = {
				id: purchase.productId,
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84.99,
				yearlyPrice: 112.25,
				discount: 3,
				valueOrder: 3,
			};
			const product2 = {
				id: purchase2.productId,
				productName: 'Free',
				description: 'Free saas product',
				monthlyPrice: 0,
				yearlyPrice: 0,
				discount: 0,
				valueOrder: 3,
			};
			return productStore.upsert(product1)
				.then(res => {
					console.log("Product 1 upsert ", res);
					return productStore.upsert(product2);
				})
				.then(res => {
					console.log("Product 2 upsert ", res);
					return purchaseStore.upsert(purchase);
				})
				.then(res => {
					console.log("purchase 1 upsert ", res);
					return purchaseStore.upsert(purchase2);
				})
				.then(res => {
					console.log("purchase 2 upsert ", res);
					return billingCtrl.getActiveUserPuchasesByProductValueOrder(user);
				})
				.then(retrievedPurchases => {
					console.log("retrieved purchases with valueOrder ", retrievedPurchases);
					retrievedPurchases.should.have.length(2);
					retrievedPurchases[0].should.have.property('valueOrder');
					retrievedPurchases[1].should.have.property('valueOrder');
					retrievedPurchases[0].productId.should.equal(product1.id);
					retrievedPurchases[0].valueOrder.should.equal(product1.valueOrder);
					retrievedPurchases[1].productId.should.equal(product2.id);
					retrievedPurchases[1].valueOrder.should.equal(product2.valueOrder);
				});
		});

		it('should filter expired user purchases', () => {
			let userId = 'userId';
			const user = { _id: userId };
			const purchase = {
				id: 'purchaseId',
				userId: userId,
				productId: 'hero',
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 14.99,
			};
			purchase.expirationDate.setFullYear(purchase.expirationDate.getFullYear() + 1); // purchase expires next year
			const purchase2 = {
				id: 'purchaseId2',
				userId: userId,
				productId: 'free',
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 0,
			};
			purchase2.expirationDate.setFullYear(purchase2.expirationDate.getFullYear() - 1); // purchase expired last year
			const product1 = {
				id: purchase.productId,
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84.99,
				yearlyPrice: 112.25,
				discount: 3,
				valueOrder: 3,
			};
			const product2 = {
				id: purchase2.productId,
				productName: 'Free',
				description: 'Free saas product',
				monthlyPrice: 0,
				yearlyPrice: 0,
				discount: 0,
				valueOrder: 3,
			};
			return productStore.upsert(product1)
				.then(res => {
					console.log("Product 1 upsert ", res);
					return productStore.upsert(product2);
				})
				.then(res => {
					console.log("Product 2 upsert ", res);
					return purchaseStore.upsert(purchase);
				})
				.then(res => {
					console.log("purchase 1 upsert ", res);
					return purchaseStore.upsert(purchase2);
				})
				.then(res => {
					console.log("purchase 2 upsert ", res);
					return billingCtrl.getActiveUserPuchasesByProductValueOrder(user);
				})
				.then(retrievedPurchases => {
					console.log("retrieved purchases with valueOrder ", retrievedPurchases);
					retrievedPurchases.should.have.length(1);
					retrievedPurchases[0].should.have.property('valueOrder');
					retrievedPurchases[0].productId.should.equal(product1.id);
					retrievedPurchases[0].valueOrder.should.equal(product1.valueOrder);
				});
		});


	});

	// TODO(jliarte): 11/10/18 make a router endpoint to call from web after loging callback from pricing page**
	describe('giveProductFreeTrialToUser', () => { // TODO(jliarte): 11/10/18 tests for assigning free trial
		beforeEach(removeAllPurchases);
		afterEach(() => { featureControllerSpy.setPlanDefaultsToUser.resetHistory(); });

		it('should add purchase if no purchase with free-trial promotion', () => {
			const user = { _id: 'userId' };
			let productId = 'hero';
			return billingCtrl.giveProductFreeTrialToUser(productId, user)
				.then(res => {
					console.log("res giving user hero free trial ", res);
					return purchaseStore.list();
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(1);
					purchases[0].userId.should.equal(user._id);
					purchases[0].productId.should.equal(productId);
					purchases[0].paymentMethod.should.equal('free-trial');
					const purchaseDate = new Date(purchases[0].purchaseDate);
					const expirationDate = new Date(purchases[0].expirationDate);
					expirationDate.getMonth().should.equal(purchaseDate.getMonth() + 1);
				});
		});

		it('should return created purchase', () => {
			const user = { _id: 'userId' };
			let productId = 'hero';
			return billingCtrl.giveProductFreeTrialToUser(productId, user)
				.then(trialDetails => {
					console.log("res giving user hero free trial ", trialDetails);
					trialDetails.userId.should.equal(user._id);
					trialDetails.productId.should.equal(productId);
					trialDetails.should.have.property('purchaseDate');
					trialDetails.should.have.property('expirationDate');
					const purchaseDate = new Date(trialDetails.purchaseDate);
					const expirationDate = new Date(trialDetails.expirationDate);
					expirationDate.getMonth().should.equal(purchaseDate.getMonth() + 1);
				});
		});

		it('should thow an error if already used free-trial promotion', () => {
			const user = { _id: 'userId' };
			let productId = 'hero';
			const purchase = {
				userId: user._id,
				productId: 'journalist',
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(), // today
				paymentMethod: 'free-trial',
				value: 0,
			};
			return purchaseStore.add(purchase)
				.then(res => {
					console.log("res creating purchase ", res);
					billingCtrl.giveProductFreeTrialToUser(productId, user).should.eventually.be.rejected;
					return purchaseStore.list();
				})
				.then(purchases => {
					console.log("retrieved purchases are ", purchases);
					purchases.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(purchases[0]);
					delete purchases[0].id;
					purchases[0].should.deep.equal(purchase);
				});
		});

		it('should assign features of product if is highest value active product', () => {
			let userId = 'userId';
			const user = { _id: userId };
			const product1 = {
				id: 'witness',
				productName: 'Witness',
				description: 'Witness saas product',
				monthlyPrice: 5,
				yearlyPrice: 7,
				discount: 0.1,
				valueOrder: 1,
			};
			const product2 = {
				id: 'hero',
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84,
				yearlyPrice: 112,
				discount: 0.3,
				valueOrder: 3,
			};
			const product3 = {
				id: 'superHero',
				productName: 'Super Hero',
				description: 'Super Hero saas product',
				monthlyPrice: 180,
				yearlyPrice: 220,
				discount: 0.3,
				valueOrder: 4,
			};
			const purchase = {
				id: 'purchaseId',
				userId: userId,
				productId: product1.id,
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 14.99,
			};
			purchase.expirationDate.setFullYear(purchase.expirationDate.getFullYear() + 1); // purchase expires next year
			const purchase2 = {
				id: 'purchaseId2',
				userId: userId,
				productId: product3.id,
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 14.99,
			};
			purchase2.expirationDate.setFullYear(purchase.expirationDate.getFullYear() - 1); // purchase expired last year
			return productStore.upsert(product1)
				.then(res => {
					console.log("Product 1 upsert ", res);
					return productStore.upsert(product2);
				})
				.then(res => {
					console.log("Product 2 upsert ", res);
					return productStore.upsert(product3);
				})
				.then(res => {
					console.log("Product 3 upsert ", res);
					return purchaseStore.upsert(purchase);
				})
				.then(res => {
					console.log("purchase 1 upsert ", res);
					return purchaseStore.upsert(purchase2);
				})
				.then(res => {
					console.log("purchase 2 upsert ", res);
					return billingCtrl.giveProductFreeTrialToUser(product2.id, user);
				})
				.then(res => {
					console.log("res giving free trial ", res);
					sinon.assert.called(featureControllerSpy.setPlanDefaultsToUser);
					sinon.assert.calledWith(featureControllerSpy.setPlanDefaultsToUser, user._id, product2.id);
				});
		});

		it('should not assign features of product if it is not the highest value active product', () => {
			let userId = 'userId';
			const user = { _id: userId };
			const product1 = {
				id: 'witness',
				productName: 'Witness',
				description: 'Witness saas product',
				monthlyPrice: 5,
				yearlyPrice: 7,
				discount: 0.1,
				valueOrder: 1,
			};
			const product2 = {
				id: 'hero',
				productName: 'Hero',
				description: 'Hero saas product',
				monthlyPrice: 84,
				yearlyPrice: 112,
				discount: 0.3,
				valueOrder: 3,
			};
			const product3 = {
				id: 'superHero',
				productName: 'Super Hero',
				description: 'Super Hero saas product',
				monthlyPrice: 180,
				yearlyPrice: 220,
				discount: 0.3,
				valueOrder: 4,
			};
			const purchase = {
				userId: userId,
				productId: product1.id,
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 14.99,
			};
			purchase.expirationDate.setFullYear(purchase.expirationDate.getFullYear() + 1); // purchase expires next year
			const purchase2 = {
				userId: userId,
				productId: product3.id,
				purchaseDate: new Date('2018/09/25 00:00 UTC'),
				expirationDate: new Date(),
				paymentMethod: 'promotion',
				value: 14.99,
			};
			purchase2.expirationDate.setFullYear(purchase.expirationDate.getFullYear() + 1); // purchase expires next year
			return productStore.upsert(product1)
				.then(res => {
					console.log("Product 1 upsert ", res);
					return productStore.upsert(product2);
				})
				.then(res => {
					console.log("Product 2 upsert ", res);
					return productStore.upsert(product3);
				})
				.then(res => {
					console.log("Product 3 upsert ", res);
					return purchaseStore.upsert(purchase);
				})
				.then(res => {
					console.log("purchase 1 upsert ", res);
					return purchaseStore.upsert(purchase2);
				})
				.then(res => {
					console.log("purchase 2 upsert ", res);
					return billingCtrl.giveProductFreeTrialToUser(product2.id, user);
				})
				.then(res => {
					console.log("res giving free trial ", res);
					sinon.assert.notCalled(featureControllerSpy.setPlanDefaultsToUser);
				});
		});


	});

});
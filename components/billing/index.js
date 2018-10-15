// components/billing/index.js

const logger = require('../../logger')(module);

const purchaseCtrl = require('./purchase');
const featureCtrl = require('../user/user-feature');
const productCtrl = require('./product');

const FREE_TRIAL_PROMOTION = 'free-trial';

function upgradeUserFeatures(user, productId) {
	logger.info("billingCtrl.upgradeUserFeatures product [" + productId + "] user [" + user._id + "]");
	return getActiveUserPuchasesByProductValueOrder(user)
		.then(purchasesByValue => {
			if (purchasesByValue && purchasesByValue.length > 0 && purchasesByValue[0].productId === productId) {
				return featureCtrl.setPlanDefaultsToUser(user._id, productId);
			}
			return [];
		});
}

function givePromotionProductToUserForAYear(user, productId, promotionName) {
  logger.info("billingCtrl.givePromotionProductToUserForAYear product [" + productId + "] promotion [" + promotionName
    + "] user [" + user._id + "]");
  const today = new Date();
  const nextYear = new Date(today.getTime());
  nextYear.setFullYear(today.getFullYear() + 1);
  const purchase = {
    userId: user._id,
    productId: productId,
    purchaseDate: today, // today
    expirationDate: nextYear, // today + 1 year
    paymentMethod: promotionName,
    value: 0,
  };
  let createdPurchase;
  return purchaseCtrl.add(purchase)
    .then(purchase => {
      createdPurchase = purchase; // TODO(jliarte): 15/10/18 never used?
      return upgradeUserFeatures(user, productId);
    });
}

function compareValueOrder(p1, p2) {
  return p2.valueOrder - p1.valueOrder;
}

function isPurchaseActive(purchase) {
  return (new Date(purchase.expirationDate) > new Date());
}

function giveProductFreeTrialToUser(productId, user) {
	logger.info("billingCtrl.giveProductFreeTrialToUser product [" + productId + "] user [" + user._id + "]");
	const today = new Date();
	const nextMonth = new Date(today.getTime());
	nextMonth.setMonth(today.getMonth() + 1);
	const purchase = {
		userId: user._id,
		productId: productId,
		purchaseDate: today, // today
		expirationDate: nextMonth, // today + 1 month
		paymentMethod: FREE_TRIAL_PROMOTION,
		value: 0,
	};
	let createdPurchase;
	return purchaseCtrl.query( { purchase: { paymentMethod: 'free-trial' } })
		.then(retrievedPurchases => {
			if (retrievedPurchases.length > 0) {
				return Promise.reject("free trial already used!");
			}
			return purchaseCtrl.add(purchase);
		})
		.then(() => upgradeUserFeatures(user, productId));
}

function getActiveUserPuchasesByProductValueOrder(user) {
	logger.info("billingCtrl.getActiveUserPuchasesByProductValueOrder to user [" + user._id + "]");
	let products = {};
  return productCtrl.list()
    .then(retrievedProducts => {
      for (let idx in retrievedProducts) {
        products[retrievedProducts[idx]._id] = retrievedProducts[idx];
      }
	    return purchaseCtrl.query({ purchase: { userId: user._id } });
    })
    .then(purchases => {
      return purchases.map(purchase => {
        let valueOrder = 0;
        if (products[purchase.productId]) {
          valueOrder = products[purchase.productId].valueOrder || 0;
        }
        purchase.valueOrder = valueOrder;
        return purchase;
      });
    })
    .then(purchases => purchases.sort(compareValueOrder))
    .then(purchases => purchases.filter(isPurchaseActive));
}

module.exports = {
  givePromotionProductToUserForAYear,
  getActiveUserPuchasesByProductValueOrder,
	giveProductFreeTrialToUser
};
// components/billing/index.js

const logger = require('../../logger')(module);

const purchaseCtrl = require('./purchase');
const featureCtrl = require('../user/user-feature');
const productCtrl = require('./product');

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
      createdPurchase = purchase;
	    return getActiveUserPuchasesByProductValueOrder(user);
    }).then(purchasesByValue => {
      if (purchasesByValue && purchasesByValue.length > 0 && purchasesByValue[0].productId === productId) {
	      return featureCtrl.setPlanDefaultsToUser(user._id, productId);
      }
      return [];
    });
}

function compareValueOrder(p1, p2) {
  return p2.valueOrder - p1.valueOrder;
}

function isPurchaseActive(purchase) {
  return (new Date(purchase.expirationDate) > new Date());
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
  getActiveUserPuchasesByProductValueOrder
};
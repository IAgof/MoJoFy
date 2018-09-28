const purchaseCtrl = require('./purchase');

function givePromotionProductToUserForAYear(user, productId, promotionName) {
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
  // TODO(jliarte): 28/09/18 set user features depending on the highest value product active purchase
  return purchaseCtrl.add(purchase);
}

module.exports = {
  givePromotionProductToUserForAYear,
};
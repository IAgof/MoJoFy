// components/billing/purchase/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');

function add(newPurchaseData) {
  logger.info("purchaseCtrl.add");
  logger.debug("...created new purchase ", newPurchaseData);
  let newPurchase = Object.assign({}, newPurchaseData);

  const purchaseModel = Model.set(newPurchase);
  logger.debug("purchase model after modelate: ", purchaseModel);
  purchaseModel.id = newPurchase.id || newPurchase._id || null; // TODO(jliarte): 20/07/18 manage id collisions
  return store.add(purchaseModel)
    .then((purchaseId) => {
      delete purchaseModel.id;
      purchaseModel._id = purchaseId;
      return purchaseModel;
    });
}

function get(purchaseId) {
  return store.get(purchaseId)
    .then(retrievedPurchase => {
      if (retrievedPurchase) {
        retrievedPurchase._id = purchaseId;
      }
      return retrievedPurchase;
    });
}

function upsert(newPurchaseData) {
  logger.info("purchaseCtrl.upsert");
  return add(newPurchaseData);
}

function list() {
  logger.info("purchaseCtrl.list");
  return store.list();
}

function query(params) {
  logger.info("purchaseCtrl.query");
  logger.debug("with params ", params);
  return store.query(params);
}

function remove(purchaseId) {
  logger.info("purchaseCtrl.remove purchase [" + purchaseId + "]");
  let purchase;
  return get(purchaseId)
    .then(retrievedPurchase => {
      logger.debug("retrieved purchase to delete is ", retrievedPurchase);
      purchase = retrievedPurchase;
      return store.remove(purchaseId);
    })
    .then(() => purchase);
}

module.exports = {
  add,
  get,
  upsert,
  list,
  query,
  remove,
};

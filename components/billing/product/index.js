// components/billing/product/index.js

const logger = require('../../../logger')(module);
const store = require('./store');
const Model = require('./model');

function add(newProductData) {
  logger.info("productCtrl.add");
  logger.debug("...created new product ", newProductData);
  let newProduct = Object.assign({}, newProductData);

  const productModel = Model.set(newProduct);
  logger.debug("product model after modelate: ", productModel);
  productModel.id = newProduct.id || newProduct._id || null;
  return store.add(productModel)
    .then((productId) => {
      delete productModel.id;
      productModel._id = productId;
      return productModel;
    });
}

function get(productId) {
  return store.get(productId)
    .then(retrievedProduct => {
      if (retrievedProduct) {
        retrievedProduct._id = productId;
      }
      return retrievedProduct;
    });
}

function upsert(newProductData) {
  logger.info("productCtrl.upsert");
  return add(newProductData);
}

function list() {
  logger.info("productCtrl.list");
  return store.list();
}

module.exports = {
  add,
  get,
  upsert,
  list,
};

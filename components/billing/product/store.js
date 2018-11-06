// components/billing/product/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const logger = require('../../../logger')(module);
const config = require('../../../config');
const insertFilter = require('../../../store/store-util').insertFilter;

const Persistent = require('../../../store/' + config.persistence_db);
const Repository = Bluebird.promisifyAll(Persistent, { promisifier: PromisifierUtils.noErrPromisifier });

const type = 'product';

// TODO(jliarte): 11/07/18 check needed indexes!
Persistent.index(type, [], logger.debug);

function upsert(productData) {
  let product = Object.assign({}, productData);
  return new Promise((resolve, reject) => {
    const id = product.id || product._id || null;
    if (!id) {
      return reject("Cannot upsert product without id");
    }
    delete product.id;
    delete product._id;

    logger.debug("product store upsert to ", config.persistence_db);
    Persistent.upsert(type, product, id, function(result, id) {
      if (result) {
        resolve(id);
      } else {
        // TODO: when does error occur????
        logger.error("Error upserting product into ", config.persistence_db);
        reject();
      }
    });
  });
}

function list() {
  return Repository.queryAsync(type, {});
}

function get(id) {
  return new Promise((resolve, reject) => {
    Persistent.get(type, id, function(data) {
      resolve(data);
    });
  });
}

function remove(id) {
  return Repository.removeAsync(type, id);
}

module.exports = {
  add: upsert,
  upsert,
  list,
  get,
  remove,
};
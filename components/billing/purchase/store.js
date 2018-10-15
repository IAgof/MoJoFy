// components/billing/purchase/store.js

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../../util/promisifier-utils');

const logger = require('../../../logger')(module);
const config = require('../../../config');
const insertFilter = require('../../../store/store-util').insertFilter;

const Persistent = require('../../../store/' + config.persistence_db);
const Repository = Bluebird.promisifyAll(Persistent, { promisifier: PromisifierUtils.noErrPromisifier });

const type = 'purchase';

// TODO(jliarte): 11/07/18 check needed indexes!
Persistent.index(type, ['userId', 'productId'], logger.debug);

function upsert(purchaseData) {
  let purchase = Object.assign({}, purchaseData);
  return new Promise((resolve, reject) => {
    const id = purchase.id || purchase._id || null;
    delete purchase.id;
    delete purchase._id;

    logger.debug("purchase store upsert to ", config.persistence_db);
    Persistent.upsert(type, purchase, id, function(result, id) {
      if (result) {
        resolve(id);
      } else {
        // TODO: when does error occur????
        logger.error("Error upserting purchase into ", config.persistence_db);
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
  // return Repository.getAsync(id);
}

function query(params) {
  const queryParams = {};
  if (params.purchase) {
    // build filter by specification
    if (params.purchase.userId && typeof params.purchase.userId === 'string') {
      insertFilter('userId', '=', params.purchase.userId, queryParams);
    }
    if (params.purchase.productId && typeof params.purchase.productId === 'string') {
      insertFilter('productId', '=', params.purchase.productId, queryParams);
    }
	  if (params.purchase.paymentMethod && typeof params.purchase.paymentMethod === 'string') {
		  insertFilter('paymentMethod', '=', params.purchase.paymentMethod, queryParams);
	  }
  }
  return Repository.queryAsync(type, queryParams);
}

function remove(id) {
  return Repository.removeAsync(type, id);
}

function removeMulti(ids) {
  return Repository._removeMulti(type, ids);
}

module.exports = {
  add: upsert,
  upsert,
  list,
  query,
  get,
  remove,
  removeMulti
};
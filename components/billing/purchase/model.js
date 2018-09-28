// components/billing/purchase/model.js

const Modelate = require('modelate');
const modelUtil = require('../../../store/model-util');

const model = {
  userId: {
    type: 'string'
  },
  productId: {
    type: 'string'
  },
  purchaseDate: {
    type: 'object',
    date: true
  },
  expirationDate: {
    type: 'object',
    date: true
  },
  paymentMethod: {
    type: 'string'
  },
  value: {
    type: 'number'
  },
  creation_date: {
    type: 'object',
    date: true
  },
  modification_date: {
    type: 'object',
    date: true
  },
};

const defaults = {
  value: 0,
};

const  noDefaultsFields = ['userId', 'productId', 'purchaseDate', 'expirationDate', 'paymentMethod'];

const Model = new Modelate('Purchase').set(model);

function set(data) {
  return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
  model: model,
  _defaults: defaults,
  set: set
};

// components/billing/product/model.js

const Modelate = require('modelate');
const modelUtil = require('../../../store/model-util');

const model = {
  productName: {
    type: 'string'
  },
  description: {
    type: 'string'
  },
  monthlyPrice: {
    type: 'number'
  },
  yearlyPrice: {
    type: 'number'
  },
  discount: {
    type: 'number'
  },
  valueOrder: {
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
  discount: 0
};

const  noDefaultsFields = ['productName', 'description', 'monthlyPrice', 'yearlyPrice', 'valueOrder'];

const Model = new Modelate('Product').set(model);

function set(data) {
  return modelUtil.set(data, Model, defaults, noDefaultsFields);
}

module.exports = {
  model: model,
  _defaults: defaults,
  set: set
};

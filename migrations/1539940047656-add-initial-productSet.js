'use strict';

const productSet = require('../commands/data_migrations/20181001_initial_productSet');

const productCtrl = require('../components/billing/product');
const productStore = require('../components/billing/product/store');

module.exports.description = "Add default product set (free, witness, journalist, hero and superHero)";

module.exports.up = function (next) {
  const initialProductSet = productSet.productSet;
  Promise.all(initialProductSet.map(product => productCtrl.add(product)))
    .then(res => {
	    console.log("Initial product set created.");
	    console.log(res);
	    next()
    });
};

module.exports.down = function (next) {
	const initialProductSet = productSet.productSet;
	Promise.all(initialProductSet.map(product => productStore.remove(product.id)))
		.then(res => {
			console.log("Initial product set removed.");
			console.log(res);
			next()
		});
};

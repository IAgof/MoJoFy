'use strict';
const initialFeatureSet = require('../commands/data_migrations/20180905_initial_featureSet');
const userFeatureCtrl = require('../components/user/user-feature');
const defaultUserId = 'default';

module.exports.description = "Add default feature set for user feature toggles for all products";

module.exports.up = function (next) {
	const featureSet = initialFeatureSet.featureSet;
	const newUserFeatures = [];

	for (let plan in featureSet) {
		featureSet[plan].forEach(feature => {
			feature.userId = defaultUserId;
			newUserFeatures.push(feature);
		});
	}

	Promise.all(newUserFeatures.map(feature => userFeatureCtrl.add(feature)))
    .then(res => {
      console.log("Initial feature set created.");
      console.log(res);
	    next();
    });
};

module.exports.down = function (next) {
  userFeatureCtrl.query({ userFeature: { userId: defaultUserId } })
	  .then(defFeatures => {
	  	return Promise.all(defFeatures.map(feature => userFeatureCtrl.remove(feature._id)));
	  })
	  .then(res => {
	  	console.log("Initial feature set removed.");
	  	console.log(res);
	  	next();
	  });
};

// components/user/user-feature/index.js

const store = require('./store');

const logger = require('../../../logger')(module);

module.exports = {
	add,
	get,
	list,
	query,
	remove,
	getDefaultsForPlan,
	setPlanDefaultsToUser,
	removeUserFeatures
};

const Model = require('./model');

function add(newUserFeatureData, user) {
	logger.info("userFeatureCtrl.add by user ", user);
	logger.debug("...created new user feature ", newUserFeatureData);
	let newUserFeature = Object.assign({}, newUserFeatureData);

	const userFeatureModel = Model.set(newUserFeature);
	logger.debug("userFeature model after modelate: ", userFeatureModel);
	userFeatureModel.id = newUserFeatureData.id || newUserFeatureData._id || null; // TODO(jliarte): 20/07/18 manage id collisions
	return store.add(userFeatureModel)
		.then((userFeatureId) => {
			delete userFeatureModel.id;
			userFeatureModel._id = userFeatureId;
			return userFeatureModel
		});
}

function get(id, user) {
	logger.info("userFeatureCtrl.get [" + id + "] by user ", user);
	return store.get(id)
		.then(userFeature => {
			if (userFeature) {
				userFeature._id = id;
			}
			return userFeature;
		});
}

function list(user) {
	logger.info("userFeatureCtrl.list by user ", user);
	return store.list();
}

function query(params, user) {
	logger.info("userFeatureCtrl.query by user ", user);
	logger.debug("...with params ", params);
	return store.query(params);
}

function remove(id) {
	logger.info("userFeatureCtrl.remove [" + id + "]");
	let deletedUserFeature;
	return store.get(id)
		.then(userFeature => {
			deletedUserFeature = userFeature;
			return store.remove(id);
		}).then(res => {
			logger.debug("removing user feature [" + id + "] result ", res);
			if (res) {
				deletedUserFeature._id = id;
				return deletedUserFeature;
			} else {
				return false; // TODO(jliarte): 26/07/18 reject, resolve or throw?
			}
		});
}

function getDefaultsForPlan(plan) {
	logger.info("userFeatureCtrl.getDefaultsForPlan for plan [" + plan + "]");
	return query({ userFeature: { userId: 'default', plan: plan} }, undefined);
}

function setPlanDefaultsToUser(userId, plan) {
	logger.info("userFeatureCtrl.setPlanDefaultsToUser for user id [" + userId + "] and plan [" + plan + "]");
	return removeUserFeatures(userId)
		.then(result => {
			return getDefaultsForPlan(plan);
		})
		.then(features => {
			features.map(feature => {
				feature.userId = userId;
				delete feature._id;
			});
			return Promise.all(features.map(feature => store.upsert(feature)));
		});
}

function removeUserFeatures(userId) {
	logger.info("userFeatureCtrl.removeUserFeatures for userId [" + userId + "]");
	return query({ userFeature: { userId: userId } }, undefined)
		.then(features => {
			logger.debug("------------- ", features);
			return store.removeMulti(features.map(feature => feature._id));
		});
}
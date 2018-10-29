// components/user/user-feature/network.js

const Controller = require('./');
const logger = require('../../../logger')(module);
const express = require('express');
const router = express.Router({ mergeParams: true });
const Acl = require('./acl').middleware;
const getFilterFunction = require('../../access/acl-filter').getFilterFunction;
const getUser = require("../../access/acl").getUser;

router.get('/', Acl, (req, res, next) => {
	logger.info("GET user feature list by user " + (user ? user._id : user));
	const aclFilter = getFilterFunction(['modification_date', 'creation_date', 'userId', '_id']);
	let user = getUser(req);
	let params = {};
	if (req.query && typeof req.query === 'object') {
		params.userFeature = {};
		params.userFeature.name = req.query.name || undefined;
		params.userFeature.userId = user._id.toString(); // TODO(jliarte): 5/09/18 should use userId in path?
	}

	if (Object.keys(params.userFeature).length === 0) {
		Controller.list()
			.then((userFeatures) => {
				res.status(200).json(aclFilter(userFeatures));
			});
	} else {
		Controller.query(params, user)
			.then((userFeatures) => {
				res.status(200).json(aclFilter(userFeatures));
			});
	}
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status || 500).json({ error: err.message });
});

module.exports = router;
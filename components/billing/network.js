// components/billing/network.js

const Controller = require('./');

const logger = require('../../logger')(module);
const express = require('express');
const router = express.Router();
const getUser = require("../access/acl").getUser;
const Acl = require('./acl').middleware;
const getFilterFunction = require('../access/acl-filter').getFilterFunction;

router.post('/trial', Acl, (req, res, next) => {
	const user = getUser(req);
	logger.info("POST /trial by user ", user);
	logger.debug("with productId ", req.body.productId);
	if (req.body.productId) {
		Controller.giveProductFreeTrialToUser(req.body.productId, user) // TODO(jliarte): 15/10/18 should we check product exists?
			.then(freeTrialPurchase => {
				const aclPurchaseFilter =
					getFilterFunction(['modification_date', 'creation_date', 'userId', '_id', 'paymentMethod', 'value']);
				res.status(200).json(aclPurchaseFilter(freeTrialPurchase));
			})
			.catch(next);
	} else {
		return res.status(400).json( { error: "Bad request, missing productId!" } );
	}
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
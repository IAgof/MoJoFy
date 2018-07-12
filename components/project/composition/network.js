// components/project/composition/network.js

const Controller = require('./index');
const Config = require('../../../config');

const logger = require('../../../logger')(module);
const express = require('express');
const router = express.Router({ mergeParams: true });
const getUser = require("../../access/acl").getUser;

router.post('/', (req, res, next) => {
	let user = getUser(req);
	logger.info("POST composition from user " + (user ? user._id : user));
	logger.debug("user is ", req.user);
	// TODO: don't overwrite? - composition without project?
	req.body.project = req.params.projectId || undefined;
	if (!user) {
		// TODO(jliarte): 12/07/18 extract helper? - ACL?
		return res.status(401).json( { error: "Unauthorized!" } );
	}
	Controller.add(req.body, user)
		.then(createdComposition => {
			res.status(201).json(createdComposition);
		})
		.catch(next);
});

router.get('/', (req, res, next) => {
	Controller.list()
		.then((compositions) => {
			res.status(200).json(compositions);
		});
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
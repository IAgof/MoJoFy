// components/project/composition/network.js

const Controller = require('./index');
const Config = require('../../../config');

const logger = require('../../../logger')(module);
const express = require('express');
const router = express.Router({ mergeParams: true });
const getUser = require("../../access/acl").getUser;

router.post('/', (req, res, next) => {
	let user = getUser(req);
	logger.info("POST media from user " + (user ? user._id : user));
	logger.debug("user is ", req.user);
	// TODO: don't overwrite? - media without track?
	req.body.trackId = req.params.trackId || undefined;
	if (!user) {
		// TODO(jliarte): 12/07/18 extract helper? - ACL?
		return res.status(401).json( { error: "Unauthorized!" } );
	}
	Controller.add(req.body, user)
		.then(createdMedia => {
			res.status(201).json(createdMedia);
		})
		.catch(next);
});

router.get('/', (req, res, next) => {
	Controller.list()
		.then((tracks) => {
			res.status(200).json(tracks);
		});
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
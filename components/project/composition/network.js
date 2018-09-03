// components/project/composition/network.js

const Controller = require('./index');

const logger = require('../../../logger')(module);
const express = require('express');
const router = express.Router({ mergeParams: true });
const getUser = require("../../access/acl").getUser;
const Acl = require('./acl').middleware;

router.post('/', (req, res, next) => {
	let user = getUser(req);
	logger.info("POST composition by user " + (user ? user._id : user));
	logger.debug("user is ", req.user);
	// TODO: don't overwrite? - composition without project?
	req.body.projectId = req.params.projectId || undefined;
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

router.get('/', Acl, (req, res, next) => {
	let user = getUser(req);
	logger.info("GET composition list by user " + (user ? user._id : user));
	const params = { composition: {} };
	if (req.query && typeof req.query === 'object') {
		params.orderBy = req.query.orderBy || 'modification_date'; // TODO(jliarte): 7/08/18 should default order be set here?
		if (req.query.created_by) {
			params.composition.created_by = req.query.created_by.toString();
		}
	}

	Controller.query(params)
		.then((compositions) => {
			res.status(200).json(compositions);
		});
});

router.get('/:compositionId', Acl, (req, res, next) => {
	const user = getUser(req);
	logger.info("GET composition by user " + (user ? user._id : user));
	const compositionId = req.params.compositionId || undefined;

	let cascade = false;
	if (req.query && typeof req.query === 'object') {
		cascade = req.query.cascade || false; // TODO(jliarte): 7/08/18 should default cascade be set here?
	}
	Controller.get(compositionId, cascade, user)
		.then((composition) => {
			res.status(200).json(composition);
		});
});

router.put('/:compositionId', (req, res, next) => {
	let user = getUser(req);
	logger.info("PUT composition [" + req.params.compositionId + "] by user " + (user ? user._id : user));
	logger.debug("user is ", req.user);
	setObjectId(req.body, req.params.id);
	// TODO: don't overwrite? - composition without project?
	req.body.projectId = req.params.projectId || undefined;
	req.body.id = req.params.compositionId;
	if (!user) {
		// TODO(jliarte): 12/07/18 extract helper? - ACL?
		return res.status(401).json( { error: "Unauthorized!" } );
	}
	Controller.update(req.body, user)
		.then(updatedComposition => {
			res.status(201).json(updatedComposition);
		})
		.catch(next);
});

function setObjectId(data, id) {
	delete data.id;
	delete data._id;
	data.id = id;
}

router.delete('/:compositionId', (req, res, next) => {
	const user = getUser(req);
	logger.info("DELETE composition [" + req.params.compositionId + "] by user " + (user ? user._id : user));
	const compositionId = req.params.compositionId || undefined;

	let cascade = false;
	if (req.query && typeof req.query === 'object') {
		cascade = req.query.cascade || false; // TODO(jliarte): 7/08/18 should default cascade be set here?
	}
	Controller.remove(compositionId, cascade, user)
		.then((composition) => {
			res.status(200).json(composition);
		});
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
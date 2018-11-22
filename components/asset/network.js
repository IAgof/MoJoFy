// components/asset/network.js

const Controller = require('./');
const Config = require('../../config');

const multer  = require('multer');
const MAX_UPLOAD_SIZE = Config.max_video_upload_byte_size;
const Upload = multer( { dest: Config.upload_folder, fileSize: MAX_UPLOAD_SIZE } );

const logger = require('../../logger')(module);
const express = require('express');
const router = express.Router({ mergeParams: true });
const getUser = require("../access/acl").getUser;
const Acl = require('./acl').middleware;

router.post('/', Acl, Upload.single('file'), (req, res, next) => {
	let user = getUser(req);
	logger.info("POST asset by user " + (user ? user._id : user));
	// TODO: don't overwrite?
	req.body.file = req.file;
	req.body.project = req.params.projectId || undefined;
	req.body.created_by = user._id;
	if (req.body.project) {
		req.body.projectId = req.body.project; // TODO(jliarte): 22/11/18 workarround until we fix app projectId field
	}
	Controller.add(req.body, user)
		.then(createdAsset => {
			res.status(201).json(createdAsset);
		})
		.catch(next);
});

router.get('/', Acl, (req, res, next) => {
	let user = getUser(req);
	logger.info("GET asset list by user " + (user ? user._id : user));
	let params = {};
	if (req.query && typeof req.query === 'object') {
		params.asset = {};
		params.asset.hash = req.query.hash || undefined;
		params.asset.created_by = req.query.created_by || undefined;
	}

	if (Object.keys(params.asset).length === 0) {
		Controller.list()
			.then((assets) => {
				res.status(200).json(assets);
			});
	} else {
		Controller.query(params, user)
			.then((assets) => {
				res.status(200).json(assets);
			});
	}
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status || 500).json({ error: err.message });
});

module.exports = router;
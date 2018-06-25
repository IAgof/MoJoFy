const Controller = require('./');
const Config = require('../../config');

const multer  = require('multer');
const MAX_UPLOAD_SIZE = Config.max_video_upload_byte_size;
const Upload = multer( { dest: Config.upload_folder, fileSize: MAX_UPLOAD_SIZE } );

const logger = require('../../logger');
const express = require('express');
const router = express.Router({ mergeParams: true });

router.post('/', Upload.single('file'), (req, res, next) => {
	// TODO: don't overwrite?
	req.body.file = req.file;
	req.body.project = req.params.projectId || undefined;
	Controller.add(req.body, req.user)
		.then(createdAsset => {
			res.status(201).json(createdAsset);
		})
		.catch(next);
});

router.get('/', (req, res, next) => {
	Controller.list()
		.then((assets) => {
			res.status(200).json(assets);
		});
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`)
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
const http = require('http');
const https = require('https');
const express = require('express');
const multer  = require('multer');
const mime = require('mime');
const Acl = require('./acl').middleware;
const Config = require('../../config');
const Response = require('../../network/response');
const logger = require('../../logger');
const Controller = require('./');

const MAX_UPLOAD_SIZE = Config.max_video_upload_byte_size;

const Upload = multer( { dest: Config.upload_folder, fileSize: MAX_UPLOAD_SIZE } );

const router = express.Router({ mergeParams: true });


// Nested components
router.use('/product_type', require('../product_type/network'));
router.use('/lang', require('../video_lang/network'));
router.use('/category', require('../video_category/network'));


router.get('/', function(req, res, next) {
	let params = {};
	if (req.query && typeof req.query === 'object') {
		params.limit = Number(req.query.limit) || 20;
		params.offset = Number(req.query.offset) || 0;
		params.order = req.query.order || 'date';
		params.tag = req.query.tag || undefined;
		params.excludeTag = req.query.excludeTag || undefined;
		if (req.query.featured != undefined) {
			params.featured = (req.query.featured == 'true');
		}
		params.user = req.params.userId || undefined;
		params.q = req.query.q || undefined;
		if (req.query.verified != undefined) {
			params.verified = (req.query.verified == 'true');
		}
	}

	Controller.list(req.user, function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	}, params);
});

router.get('/:id/original', Acl, function(req, res, next) {
	Controller.download(req.params.id, req.query.code, req.owner, function(data, err, code) {
		if(!err) {
			const splitUrl = data.split('/');
			const filename = splitUrl[splitUrl.length - 1];
			const type = mime.getType(filename);
			res.setHeader('Content-disposition', 'attachment; filename=' + filename);
			res.setHeader('content-type', type);
			res.setHeader('x-filename', filename);
			res.setHeader('access-control-expose-headers', 'x-filename, content-type');

			let transport = http;
			if (data.startsWith('https')) {
				transport = https;
			}
			transport.get(data, function(file) {
				file.pipe(res);
			});
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/user/:id', Acl, function(req, res, next) {
	Controller.query({filters: [{field: 'owner', operator: '=', value: req.params.id}]}, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/:id', function(req, res, next) {
  	Controller.get(req.params.id, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.post('/', Upload.single('file'), function(req, res, next) {
// router.post('/', Acl, Upload.single('file'), function(req, res, next) {
	req.body.file = req.file;

	Controller.add(req.body, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

// router.put('/', Upload.single('file'), function(req, res, next) {
router.put('/:id', Acl, Upload.any(), function(req, res, next) {
	req.body.files = req.files;
	req.body.id = req.params.id;
	logger.info("Handling video " + req.params.id + " put");
	if (req.body.location && typeof req.body.location === 'string') {
		try {
			req.body.location = JSON.parse(req.body.location);
		} catch (err) {
			logger.error("Error parsing location ", req.body.location);
		}
	}

	Controller.update(req.body, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

// router.post('/:id/like', function(req, res, next) {
router.post('/:id/like', Acl, function(req, res, next) {
	Controller.like(req.params.id, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});


router.delete('/:id', Acl,  function(req, res, next) {
  	Controller.remove(req.params.id, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

module.exports = router;

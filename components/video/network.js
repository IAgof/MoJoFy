const http = require('http');
const https = require('https');
const express = require('express');
const multer  = require('multer');
const mime = require('mime');
const Acl = require('./acl').middleware;
const Config = require('../../config');
const Response = require('../../network/response');
const Controller = require('./');

const Upload = multer({ dest: Config.upload_folder });

const router = express.Router({ mergeParams: true });


router.get('/:id(\\d+)/', function(req, res, next) {
  	Controller.get(req.params.id, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/', function(req, res, next) {
	var query;
	if (req.query && typeof req.query === 'object') {
		query = {};
		query.limit = Number(req.query.limit) || 20;
		query.offset = Number(req.query.offset) || 0;
		query.order = req.query.order || 'date';
		query.tag = req.query.tag || undefined;
		query.excludeTag = req.query.excludeTag || undefined;
		query.user = Number(req.params.userId) || undefined;
	}

	Controller.list(req.user, function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	}, query);
});

router.get('/:id/original', function(req, res, next) {
	const code = req.query.code || null;

	Controller.download(req.params.id, code, function(data, err, code) {
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
router.put('/', Acl, Upload.single('file'), function(req, res, next) {
	req.body.file = req.file;

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

const express = require('express');
const Acl = require('./acl').middleware;
const Response = require('../../network/response');
const Controller = require('./');
const multer = require('multer');
const Config = require('../../config');

const router = express.Router();

const MAX_UPLOAD_SIZE = Config.max_profile_upload_byte_size;

const Upload = multer({ dest: Config.upload_folder, fileSize: MAX_UPLOAD_SIZE });

	// nested routes
router.use('/:userId/video', require('../video/network'));

router.get('/exist', function(req, res, next) {
// router.get('/exist?:name&:email', Acl,  function(req, res, next) {
	Controller.exist(req.query, req.user, function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/getId', function(req, res, next) {
	if (!req.user) {
		return Response.error(req, res, next, 401, 'Unauthorized');
	}
	Controller.getUserId(req.user.sub, function(user, err, code) {
		if (!err) {
			if (!user) {
				return Response.error(req, res, next, 404, 'User not found!');
			}
			Response.success(req, res, next, (code || 200), { id: user._id } );
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/', function(req, res, next) {
	Controller.list(req.user, function(data, err, code) {
		if (!err) {
			data.forEach(item => { delete item.authId; });
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

// router.post('/', Acl,  function(req, res, next) {
router.post('/', function(req, res, next) {
	Controller.add(req.body, req.user, function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.put('/', Acl, Upload.single('pic'), function(req, res, next) {
	Controller.update(req.body, req.user, req.file, function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

// router.get('/:id', Acl,  function(req, res, next) {
router.get('/:id', function(req, res, next) {
  Controller.get(req.params.id, req.user, false, function(data, err, code) {
		if (!err) {
			delete data.authId;
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

module.exports = router;

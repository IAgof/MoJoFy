const express = require('express');
const getUserId = require("../access/acl").getUserId;
const getUser = require("../access/acl").getUser;
const Acl = require('./acl').middleware;
const aclQuery = require('./acl').query;
const getFilterFunction = require('../access/acl-filter').getFilterFunction;
const logger = require('../../logger')(module);
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
	Controller.exist(req.query, getUser(req), function(data, err, code) {
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
	logger.debug("user router GET /getId with req.user ", req.user);

	let authId = req.user.sub;
	Controller.getUserId(authId, function(user, err, code) {
		if (!err) {
			if (!user) {
				return Response.error(req, res, next, 404, 'User not found!');
			}
			if (req.query.prehisteric) {
				let prehisteric = req.query.prehisteric;
				if (typeof req.query.prehisteric === 'string') {
          prehisteric = (req.query.prehisteric == 'true');
        }
				Controller.setPrehistericUser(user, prehisteric);
			}
			Response.success(req, res, next, (code || 200), { id: user._id } );
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/', function(req, res, next) {
	Controller.list(getUser(req), function(data, err, code) {
		if (!err) {
			const filteredFields = ['modification_date', 'creation_date', 'authId', 'password'];
			aclQuery(getUser(req), 'see_email', function (allowed) {
				if (!allowed) {
					filteredFields.push('email');
				}
				const aclFilter = getFilterFunction(filteredFields);
				Response.success(req, res, next, (code || 200), aclFilter(data));
			});
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.post('/', function(req, res, next) {
	Controller.add(req.body, getUser(req), function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.put('/', Acl, Upload.single('pic'), function(req, res, next) {
	Controller.update(req.body, getUser(req), req.file, function(data, err, code) {
		if (!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/:id', function(req, res, next) {
  Controller.get(req.params.id, function(data, err, code) {
		if (!err) {
			const filteredFields = ['modification_date', 'creation_date', 'authId', 'password'];
			aclQuery(getUser(req), 'see_email', function (allowed) {
				if (!allowed) {
					filteredFields.push('email');
				}
				const aclFilter = getFilterFunction(filteredFields);
				Response.success(req, res, next, (code || 200), aclFilter(data));
			});
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

module.exports = router;

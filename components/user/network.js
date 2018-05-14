const express = require('express');
const Acl = require('./acl').middleware;
const Response = require('../../network/response');
const Controller = require('./');

const router = express.Router();


router.get('/exist', function(req, res, next) {
// router.get('/exist?:name&:email', Acl,  function(req, res, next) {
	Controller.exist(req.query, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/',   function(req, res, next) {
	Controller.list(req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

// router.post('/', Acl,  function(req, res, next) {
router.post('/',  function(req, res, next) {
	Controller.add(req.body, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.put('/', Acl,  function(req, res, next) {
	Controller.update(req.body, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

// router.get('/:id', Acl,  function(req, res, next) {
router.get('/:id', function(req, res, next) {
  Controller.get(req.params.id, req.user, undefined, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

module.exports = router;

const express = require('express');
const multer  = require('multer');
const Acl = require('./acl').middleware;
const Config = require('../../config');
const Response = require('../../network/response');
const Controller = require('./');

const Upload = multer({ dest: Config.upload_folder });

const router = express.Router();


router.get('/', Acl,  function(req, res, next) {
	Controller.list(req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/user/:id', Acl,  function(req, res, next) {
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

router.get('/:id', Acl,  function(req, res, next) {
  	Controller.get(req.params.id, req.user, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});


module.exports = router;

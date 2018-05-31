const express = require('express');
const Acl = require('./acl').middleware;
const Response = require('../../network/response');
const Controller = require('./');

const router = express.Router();

router.post('/', Acl,  function(req, res, next) {
	const uid = req.user.sub || -1;
	const clientId = req.body.client || null;
	const videoId = req.body.video || null;
	const method = req.body.method || null;

	Controller.add(uid, clientId, videoId, method, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

router.get('/:id', Acl,  function(req, res, next) {
	Controller.get(req.params.id, function(data, err, code) {
		if(!err) {
			Response.success(req, res, next, (code || 200), data);
		} else {
			Response.error(req, res, next, (code || 500), err);
		}
	});
});

module.exports = router;

const Controller = require('./');

const logger = require('../../logger');
const express = require('express');
const router = express.Router({ mergeParams: true });

router.post('/', (req, res, next) => {
	// TODO: don't overwrite?
	req.body.project = req.params.projectId || undefined;
	Controller.add(req.body, req.user)
		.then(createdComposition => {
			res.status(201).json(createdComposition);
		})
		.catch(next);
});

router.get('/', (req, res, next) => {
	Controller.list()
		.then((compositions) => {
			res.status(200).json(compositions);
		});
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`)
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
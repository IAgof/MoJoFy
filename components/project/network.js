const Controller = require('./');

const logger = require('../../logger');
const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
	Controller.add(req.body, req.user)
		.then(createdProject => {
			res.status(201).json(createdProject);
		})
		.catch(next);
});

router.get('/', (req, res, next) => {
	Controller.list()
		.then((projects) => {
			res.status(200).json(projects);
		});
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`)
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
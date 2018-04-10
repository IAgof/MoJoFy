const Controller = require('./');

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	Controller.list()
		.then((categories) => {
			res.status(200).json(categories);
		})
});

module.exports = router;
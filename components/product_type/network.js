const Controller = require('./');

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	Controller.list()
		.then((productTypes) => {
			res.status(200).json(productTypes);
		})
});

module.exports = router;
const Controller = require('./');

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	Controller.list()
		.then((videoLangs) => {
			res.status(200).json(videoLangs);
		})
});

module.exports = router;
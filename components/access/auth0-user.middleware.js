const request = require('request');
const logger = require('../../logger');

const userController = require('../user');

function getUserInfo(authorization) {
	return new Promise((resolve, reject) => {
		const options = {
			url: 'https://vimojo.eu.auth0.com/userinfo',
			headers: {
				'Authorization': authorization,
				'Content-Type': 'application/json'
			}
		};

		request(options, function (error, response, userInfo) {
			logger.debug('calling userinfo endpoint');
			if (!error && response.statusCode == 200) {
				resolve(userInfo);
			} else  {
				reject({ error: error, code: response.statusCode });
			}
		});
	});

}

module.exports = function (req, res, next) {
	// if (req.user.sub not exist) {
	// 	call auth userinfo endpoint
	// 		then ->
	// 			create user with userinfo
	// 			update user metadata with role
	// 			-> update auth0 user metadata
	// }
	if (req.user && req.user.sub) {
		logger.debug("Request with user: ", req.user);
		logger.debug("request headers are: ", req.headers);
		logger.debug("auth is: ", req.headers.authorization.split(' ')[1]);

		userController.get(req.user.sub, null, (existingUser, errorCode) => {
			logger.debug("existing user is ", existingUser);
			if (!existingUser) {
				logger.debug("User with id " + req.user.sub + " not found, creating new user...");
				getUserInfo(req.headers.authorization)
					.then(userInfo => {
						userInfo = JSON.parse(userInfo);
						user = { id: req.user.sub };
						user.username = userInfo.nickname;
						user.name = userInfo.name;
						user.email = userInfo.email;
						user.verified = userInfo.email_verified;
						user.updated_at = userInfo.updated_at;
						user.pic = userInfo.picture;

						logger.debug("Created user model: ", user);
					});

			}
		}, false);
	}
	next();
};
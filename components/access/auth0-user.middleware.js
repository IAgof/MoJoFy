const Bluebird = require('bluebird');
const request = require('request');

const logger = require('../../logger')(module);
const PromisifierUtils = require('../../util/promisifier-utils');

const userComponentCB = require('../user');
const userController = Bluebird.promisifyAll(userComponentCB, { promisifier: PromisifierUtils.noErrPromisifier });

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
			if (!error && response.statusCode == 200) {
				resolve(userInfo);
			} else  {
				reject({ error: error, code: response.statusCode });
			}
		});
	});
}

function createFromUserInfo(req) {
	return getUserInfo(req.headers.authorization)
		.then(userInfo => {
			userInfo = JSON.parse(userInfo);
			user = {authId: req.user.sub};
			user.username = userInfo.nickname;
			user.name = userInfo.name;
			user.email = userInfo.email;
			user.verified = userInfo.email_verified;
			user.updated_at = userInfo.updated_at;
			user.pic = userInfo.picture;

			return userController.addAsync(user, null);
		});
	// .then(user => {
	// 	logger.debug("Created user model: ", user);
	// });
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
		// TODO(jliarte): 28/06/18 handle user grouping when same email is received
		// TODO(jliarte): 28/06/18 use Async?
		userController.getUserId(req.user.sub, (existingUser) => {
			if (!existingUser) {
				logger.debug("User with authId " + req.user.sub + " not found, creating new user...");
				return createFromUserInfo(req)
					.then(user => req.user.userProfile = user)
					.then(() => next());
			} else {
				req.user.userProfile = existingUser;
				return next();
			}
		});
	}
	return next();
};
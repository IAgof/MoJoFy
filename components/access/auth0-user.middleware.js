const Bluebird = require('bluebird');
const request = require('request');

const auth0_metadata_ns = require('../../config').auth0_metadata_ns;
const config = require('../../config');
const logger = require('../../logger')(module);
const PromisifierUtils = require('../../util/promisifier-utils');

const userComponentCB = require('../user');
const userController = Bluebird.promisifyAll(userComponentCB, {promisifier: PromisifierUtils.noErrPromisifier});

function getUserInfo(authorization, authId) {
	logger.debug("Getting user info for authId " + authId + " at ", config.auth0_base_uri);
	return new Promise((resolve, reject) => {
		const options = {
			url: config.auth0_base_uri + '/userinfo',
			headers: {
				'Authorization': authorization,
				'Content-Type': 'application/json'
			}
		};

		request(options, function (error, response, userInfo) {
			if (!error && response && response.statusCode == 200) {
				logger.debug("got userInfo response, ", JSON.parse(userInfo));
				resolve(JSON.parse(userInfo));
			} else {
				logger.error("Error retrieving userInfo from auth0 ", error);
				logger.error("response body", response.body);
				logger.error("response statusCode", response.statusCode);
				// (jliarte): 5/07/18 return empty userInfo for flow to continue
				resolve({ sub: authId });
			}
		});
	});
}

function createOrUpdateUserWithUserInfo(existingUser, userInfo) {
	if (!existingUser) {
		existingUser = { email: userInfo.email };
	}
	// (jliarte): 2/07/18 Update all fields but email
	// TODO(jliarte): 2/07/18 manage authId conflicts - associate accounts!
	existingUser.authId = userInfo.sub || existingUser.authId;
	existingUser.username = userInfo.nickname || existingUser.username;
	existingUser.name = userInfo.name || existingUser.name ;
	existingUser.email = userInfo.email || existingUser.email;
	existingUser.verified = userInfo.email_verified || existingUser.verified;
	existingUser.updated_at = userInfo.updated_at || existingUser.updated_at;
	existingUser.pic = userInfo.picture || existingUser.pic;

	// TODO(jliarte): 4/07/18 let backend to be the central role info source? now it's auth0
	if (userInfo[auth0_metadata_ns + 'role'] && userInfo[auth0_metadata_ns + 'role'] != '') {
		existingUser.role = userInfo[auth0_metadata_ns + 'role'];
	}

	if (existingUser._id) {
		return userController.updateAsync(existingUser, null, null);
	} else {
		return userController.addAsync(existingUser, null);
	}
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
		const authId = req.user.sub;
		let userInfo = {};
		return userController.getUserIdAsync(authId)
			.then(existingUser => {
				if (!existingUser) {
					logger.debug("User with authId " + authId + " not found, querying by email...");
					// (jliarte): 5/07/18 only call userInfo if we need email for searching!
					// TODO(jliarte): 28/06/18 handle user grouping when same email is received
						return getUserInfo(req.headers.authorization, req.user.sub)
						.then(data => {
							userInfo = data;
							return userController.getUserByEmailAsync(userInfo.email);
						});
				} else {
					return existingUser;
				}
			})
			.then(existingUser => {
				return createOrUpdateUserWithUserInfo(existingUser, userInfo);
			})
			.then(user => req.user.userProfile = user)
			.then(() => next())
			.catch(err => {
				logger.error("Error on auth0 user middleware ", err);
				next();
			});
	} else {
		logger.debug("no req.user, exiting");
		return next();
	}
};
const Bluebird = require('bluebird');
const request = require('request');

const auth0_metadata_ns = require('../../config').auth0_metadata_ns;
const logger = require('../../logger')(module);
const PromisifierUtils = require('../../util/promisifier-utils');

const userComponentCB = require('../user');
const userController = Bluebird.promisifyAll(userComponentCB, {promisifier: PromisifierUtils.noErrPromisifier});

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
			} else {
				reject({error: error, code: response.statusCode});
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
	existingUser.authId = userInfo.sub;
	existingUser.username = userInfo.nickname;
	existingUser.name = userInfo.name;
	existingUser.email = userInfo.email;
	existingUser.verified = userInfo.email_verified;
	existingUser.updated_at = userInfo.updated_at;
	existingUser.pic = userInfo.picture;

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
		return getUserInfo(req.headers.authorization)
			.then(data => {
				userInfo = JSON.parse(data);
				return userController.getUserIdAsync(authId);
			})
			.then(existingUser => {
				if (!existingUser) {
					logger.debug("User with authId " + authId + " not found, querying by email...");
					// TODO(jliarte): 28/06/18 handle user grouping when same email is received
					return userController.getUserByEmailAsync(userInfo.email);
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
				logger.debug("Error on auth0 user middleware ", err);
				next();
			});
	} else {
		logger.debug("exiting");
		return next();
	}
};
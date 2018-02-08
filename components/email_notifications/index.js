const logger = require('../../logger');
const config = require('../../config');
const user = require('../user');
const videoRepository = require('../video');
const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const sendgridMail = require('@sendgrid/mail');
sendgridMail.setApiKey(config.sendgridApiKey);

function getTemplate (path, mapObj) {
	return fs.readFileAsync(path, 'utf-8')
		.then(source => {
			return Handlebars.compile(source.toString())(mapObj);
		})
};

function sendNotificationVideoUploadedMail(user, video) {
	// TODO: Keep an eye on i18n
	var subject = 'Se ha subido un nuevo vídeo a Vimojo.';
	if (user) {
		subject = user.name + ' ha subido un nuevo vídeo a Vimojo.';
	}
	const msg = {
		to: config.emailNotificationsRecipient,
		from: config.emailNotificationsSender,
		subject: subject,
		html: '',
	};
	getTemplate('./src/templates/notifyVideoUploaded.hbs', {
		title: video.title,
		description: video.description,
		date: video.date,
		type: video.productType,
		url: config.frontend_url + '/video/' + video._id,
		vimojo_logo: 'http://vimojo.co/wp-content/uploads/2017/11/Vimojo.png',
		platform_url: 'http://vimojo.co',
		poster: video.poster,
	}).then(data => {
		msg.html = data;
		sendgridMail.send(msg);
	}).catch(e => {
		logger.error(e);
		throw new Error('Unable to get a piece of email');
	});
}

function notifyVideoUploaded(video) {
	logger.debug("Notification of uploaded video ", video);
	user.get(video.owner, null, function (user) {
		sendNotificationVideoUploadedMail(user, video);
	});
}

module.exports = {
    notifyVideoUploaded
};
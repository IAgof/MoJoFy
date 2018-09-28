const logger = require('../../logger')(module);
const config = require('../../config');
const user = require('../user');
const videoRepository = require('../video');
const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const templatePath = './src/templates/' + config.flavour;

const sendgridMail = require('@sendgrid/mail');
sendgridMail.setApiKey(config.sendgridApiKey);

function getTemplate(path, mapObj) {
	return fs.readFileAsync(path, 'utf-8')
		.then(source => {
			return Handlebars.compile(source.toString())(mapObj);
		})
}

function sendNotificationVideoUploadedMail(user, video) {
	if (!config.emailNotificationsRecipient) {
		return;
	}
	// TODO: Keep an eye on i18n
  let subject = 'Se ha subido un nuevo vídeo a Vimojo.';
  if (user) {
		subject = (user.username || 'Se') + ' ha subido un nuevo vídeo a Vimojo.';
	}
	const msg = {
		to: config.emailNotificationsRecipient,
		from: config.emailNotificationsSender,
		subject: subject,
		html: '',
	};
	getTemplate(templatePath + '/notify-video-uploaded.hbs', {
		title: video.title,
		description: video.description,
		date: video.date,
		type: video.productType,
		url: config.frontend_url + '/video/' + video._id,
		vimojo_logo: 'http://vimojo.co/wp-content/uploads/2017/11/Vimojo.png',
		platform_url: 'http://vimojo.co',
		poster: video.poster,
	}).then(data => {
		logger.debug("Sending notification of uploaded video ", video);
		msg.html = data;
		sendgridMail.send(msg);
	}).catch(e => {
		logger.error(e);
		throw new Error('Unable to get a piece of email');
	});
}

function notifyVideoUploaded(video) {
	user.get(video.owner, null, false, function (user) {
		sendNotificationVideoUploadedMail(user, video);
	});
}

function notifyVideoCodesGenerated(videoId, codes) {
	if (!config.emailNotificationsRecipient) {
		return;
	}
	if (codes) {
		const subject = "Nuevos códigos de descarga generados para el vídeo " + videoId;
		const msg = {
			to: config.emailNotificationsRecipient,
			from: config.emailNotificationsSender,
			subject: subject,
			html: '',
		};
		let generatedCodesString = "Los códigos generados son: " + codes.map(elem => {
			return elem.code;
		}).join(", ");
		getTemplate(templatePath + '/notify-video-codes-generated.hbs', {
			title: "Se han generado " + codes.length + " códigos de descarga",
			description: generatedCodesString,
			url: config.frontend_url + '/download/' + videoId,
			vimojo_logo: 'http://vimojo.co/wp-content/uploads/2017/11/Vimojo.png',
			platform_url: 'http://vimojo.co',
			poster: '',
		}).then(data => {
			logger.debug("Sending notification of generated codes for video ", videoId);
			msg.html = data;
			sendgridMail.send(msg);
		}).catch(e => {
			logger.error(e);
			throw new Error('Unable to get a piece of email');
		});
	}
}

function sendPrehistericPromotionWelcomeEmail(user) {
	const prehistoricPromoText = ""; // TODO(jliarte): 28/09/18 put in template or include i18n setup!!!
  const templateVars = {
    title: "¡Gracias por confiar en nosotros!",
    description: prehistoricPromoText,
    // url: config.frontend_url + '/download/' + videoId,
    vimojo_logo: 'http://vimojo.co/wp-content/uploads/2017/11/Vimojo.png',
    platform_url: 'http://vimojo.co',
    poster: '',
  };
  const subject = "¡Enhorabuena " + user.username + "! Le regalamos una subscricpción anual a hero gratis!"; // TODO(jliarte): 28/09/18 i18n
  const msg = {
    to: user.email,
    from: config.emailNotificationsSender,
    subject: subject,
    html: '',
  };

  return getTemplate(templatePath + '/notify-video-codes-generated.hbs', templateVars)
	  .then(data => {
      logger.info("Sending prehistoric promo notification to user ", user._id);
      msg.html = data;
	  	return sendgridMail.send(msg);
	  });
}

module.exports = {
	notifyVideoUploaded,
	notifyVideoCodesGenerated,
	sendPrehistericPromotionWelcomeEmail
};
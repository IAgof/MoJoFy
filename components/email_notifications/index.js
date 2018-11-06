const logger = require('../../logger')(module);
const config = require('../../config');
const user = require('../user');
const videoRepository = require('../video');
const Handlebars = require('handlebars');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const i18n = require('i18n');

const templatePath = './src/templates/' + config.flavour;

const sendgridMail = require('@sendgrid/mail');
sendgridMail.setApiKey(config.sendgridApiKey);

i18n.configure({
	locales: config.supportedLocales,
	directory: __dirname + '/locales',
	register: global,
	updateFiles: config.updateLocaleFiles || false,
});

Handlebars.registerHelper('__', function () {
	return i18n.__.apply(i18n, arguments);
});

Handlebars.registerHelper('__n', function () {
	return i18n.__n.apply(i18n, arguments);
});

function getTemplate(path, mapObj) {
	return fs.readFileAsync(path, 'utf-8')
		.then(source => {
			return Handlebars.compile(source.toString())(mapObj);
		})
}

function sendNotificationVideoUploadedMail(user, video) {
	if (!config.emailNotificationsRecipient) {
		logger.info("No emailNotificationsRecipient configured, nobody to send notifications!");
		return Promise.resolve();
	}

	i18n.setLocale(user.lang || config.defaultLocale);
  let subject = i18n.__('New video uploaded to Vimojo');
  if (user && user.username) {
	  subject = i18n.__('{{username}} uploaded a new video to Vimojo', { username: user.username });
	}
	const msg = {
		to: config.emailNotificationsRecipient,
		from: config.emailNotificationsSender,
		subject: subject,
		html: '',
	};
	return getTemplate(templatePath + '/notify-video-uploaded.hbs', { // TODO(jliarte): 23/10/18 translate template
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
		return sendgridMail.send(msg);
	}).catch(e => {
		logger.error(e);
		throw new Error('Unable to get a piece of email');
	});
}

function notifyVideoUploaded(video) {
	logger.debug("notifyVideoUploaded for video ", video._id);
	return new Promise((resolve, reject) => {
		user.get(video.owner, function (user) {
			sendNotificationVideoUploadedMail(user, video)
				.then(res => {
					resolve(res);
				})
				.catch(error => {
					reject(error);
				});
		});
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
	i18n.setLocale(user.lang || config.defaultLocale);
	const username = user.name || 'user';
	const templateVars = {
    title: i18n.__('Thank you for trusting in us'),
    vimojo_logo: 'http://vimojo.co/wp-content/uploads/2017/11/Vimojo.png',
    platform_url: 'http://vimojo.co', // TODO(jliarte): 24/10/18 make maintenable URLs
    poster: '',
		userGreeting: i18n.__('userMailGreeting', { username: username }),
		username: username,
	  cta_url: 'http://platform.vimojo.co/pricing'
  };
  const subject = i18n.__('Congratulations {{username}}! We give you a free subscription to Hero plan!',
	  { username: username });
  const msg = {
    to: user.email,
    from: config.emailNotificationsSender,
    subject: subject,
    html: '',
  };

  return getTemplate(templatePath + '/notify-prehisteric-user-promotion.hbs', templateVars)
	  .then(data => {
	  	logger.info("Sending prehistoric promo notification to user ", user._id);
		  msg.html = data;
	  	return sendgridMail.send(msg);
	  });
}

module.exports = {
	notifyVideoUploaded,
	notifyVideoCodesGenerated,
	sendPrehistericPromotionWelcomeEmail,
};
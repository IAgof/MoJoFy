const logger = require('../../logger');
const config = require('../../config');
const videoRepository = require('../video');

const sendgridMail = require('@sendgrid/mail');
sendgridMail.setApiKey(config.sendgridApiKey);


function notifyVideoUploaded(video) {
    logger.debug("Notification of uploaded video ", video);
    // videoRepository.get()
    // const videoId = video._id;
    // const videoTitle = video.title;
    // const videoDescription = video.description;
    // const videoProductType = video.productType;
    // const videoDate = video.date;

    const msg = {
        to: config.emailNotificationsRecipient,
        from: config.emailNotificationsSender,
        subject: 'New video uploaded to Vimojo',
        text: 'A new video has been uploaded to vimojo platform!\n' +
        'Title: ' + video.title + '\n' +
        'Description: ' + video.description + '\n' +
        'url: http://localhost:8080/#!/video/' + video.id,
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    logger.debug("About to send a msg: ", msg);
    sendgridMail.send(msg);
}

module.exports = {
    notifyVideoUploaded
};
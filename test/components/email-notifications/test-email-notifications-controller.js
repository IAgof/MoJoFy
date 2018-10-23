// test/components/email-notifications/test-email-notifications-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const sinon = require('sinon');
const rewire = require("rewire");

const sendgridMailSpy = {
  faked: true,
  send: sinon.stub().returns(Promise.resolve("email sent"))
};

const mockedUserCtrl = {
  faked: true,
  get: sinon.stub().callsArgWith(1, true)
};

let templateResult = "processed template";
const mockedGetTemplate = sinon.stub().returns(Promise.resolve(templateResult));
const emailNotificationsCtrl = rewire('../../../components/email_notifications');
emailNotificationsCtrl.__set__("sendgridMail", sendgridMailSpy);
emailNotificationsCtrl.__set__("getTemplate", mockedGetTemplate);
const mockedConfig = { emailNotificationsRecipient: 'email@receiver', emailNotificationsSender: 'email@sender' };
emailNotificationsCtrl.__set__("config", mockedConfig);
emailNotificationsCtrl.__set__("user", mockedUserCtrl);

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.use(require('chai-string'));
const should = chai.should();

describe('EmailNotifications controller', () => {

  describe('sendPrehistericPromotionWelcomeEmail', () => {

    it('should get prehistoric template with right params', () => {
      const user = {
        _id: 'user.id',
        username: 'User Name',
        email: 'user@email'
      };
      const templateName = 'notify-video-codes-generated.hbs';
      const prehistoricPromoText = "";
      const templateVars = {
        title: "¡Gracias por confiar en nosotros!",
        description: prehistoricPromoText,
        // url: mockedConfig.frontend_url + '/download/' + videoId,
        vimojo_logo: 'http://vimojo.co/wp-content/uploads/2017/11/Vimojo.png',
        platform_url: 'http://vimojo.co',
        poster: '',
      };
      return emailNotificationsCtrl.sendPrehistericPromotionWelcomeEmail(user)
        .then(result => {
          console.log("sendPrehistericPromotionWelcomeEmail result ", result);
          sinon.assert.called(mockedGetTemplate);
          let getTemplateArgs = mockedGetTemplate.getCall(0).args;
          console.log('call args are ', getTemplateArgs);
          const templatePath = getTemplateArgs[0];
          const params = getTemplateArgs[1];
          templatePath.should.endWith(templateName);
          params.should.deep.equal(templateVars);
        });
    });

    it('should send email to sendgrid for delivery', () => {
      const user = {
        _id: 'user.id',
        username: 'User Name',
        email: 'user@email'
      };
      const subject =  "¡Enhorabuena " + user.username + "! Le regalamos una subscricpción anual a hero gratis!";
      const msg = {
        to: user.email,
        from: mockedConfig.emailNotificationsSender,
        subject: subject,
        html: templateResult,
      };
      return emailNotificationsCtrl.sendPrehistericPromotionWelcomeEmail(user)
        .then(result => {
          console.log("sendPrehistericPromotionWelcomeEmail result ", result);
          sinon.assert.called(sendgridMailSpy.send);
          let mail = sendgridMailSpy.send.getCall(0).args[0];
          console.log('send args are ', mail);
          mail.should.deep.equal(msg);
        });
    });


  });

	describe('notifyVideoUploaded', () => {

		it('should call user controller get with userId param from video.owner', () => {
			const userId = 'videoOwnerId';
			const video = {
		    _id: 'videoId',
        owner: userId,
      };
		  const user = {
		    email: 'user@email',
        _id: userId
      };
		  mockedUserCtrl.get = sinon.stub().callsArgWith(1, user);
		  return emailNotificationsCtrl.notifyVideoUploaded(video)
        .then(res => {
          console.log("res notifying video uploaded ", res);
	        sinon.assert.called(mockedUserCtrl.get);
	        sinon.assert.calledWith(mockedUserCtrl.get, video.owner);
	        let getArgs = mockedUserCtrl.get.getCall(0).args;
	        getArgs.should.have.length(2);
	        // TODO(jliarte): 22/10/18 test for below code
	        // sinon.assert.called(sendgridMailSpy.send);
	        // let mail = sendgridMailSpy.send.getCall(0).args[0];
	        // console.log('send args are ', mail);
	        // mail.should.deep.equal({});
        });
		});

	});

});
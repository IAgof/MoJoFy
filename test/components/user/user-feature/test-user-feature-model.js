// test/components/user/user-feature/test-user-feature-model.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const UserFeature = require('../../../../components/user/user-feature/model');

const testUtil = require('../../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

describe('UserFeature model', () => {
	describe('set', () => {

		it('should set default values for empty fields', () => {
			const userFeature = {
			};
			let modelatedUserFeature = UserFeature.set(userFeature);
			modelatedUserFeature.should.deep.equal(UserFeature._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});
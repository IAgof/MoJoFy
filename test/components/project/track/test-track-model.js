process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Track = require('../../../../components/project/track/model');

const testUtil = require('../../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllTracks() {
	return testUtil.removeAllEntities('track');
}

describe('Track model', () => {
	describe('set', () => {
		beforeEach(removeAllTracks);

		it('it should set default values for empty fields', () => {
			const composition = {
			};
			let modelatedTrack = Track.set(composition);
			modelatedTrack.should.deep.equal(Track._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});
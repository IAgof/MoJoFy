process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Media = require('../../../../components/project/media/model');

const testUtil = require('../../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllMedias() {
	return testUtil.removeAllEntities('media');
}

describe('Media model', () => {
	describe('set', () => {
		beforeEach(removeAllMedias);

		it('it should set default values for empty fields', () => {
			const media = {
			};
			let modelatedMedia = Media.set(media);
			modelatedMedia.should.deep.equal(Media._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});
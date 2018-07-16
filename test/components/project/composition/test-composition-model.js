process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Composition = require('../../../../components/project/composition/model');

const testUtil = require('../../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllCompositions() {
	return testUtil.removeAllEntities('composition');
}

describe('Composition model', () => {
	describe('set', () => {
		beforeEach(removeAllCompositions);

		it('it should set default values for empty fields', () => {
			const composition = {
			};
			modelatedProject = Composition.set(composition);
			modelatedProject.should.deep.equal(Composition._defaults);
		});

		// it('it should create a default date value if not present', () => {
		// });

	});

});
process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Project = require('../../../components/project/model');

const testUtil = require('../../test-util');

// Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllProjects() {
	return testUtil.removeAllEntities('project');
}

describe('Project model', () => {
	describe('set', () => {
		beforeEach(removeAllProjects);

		it('it should set default values for empty fields', () => {
			const project = {
			};
			modelatedProject = Project.set(project);
			modelatedProject.should.deep.equal(Project._defaults);
		});

	});

});
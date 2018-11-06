process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const projectStore = require('../../../components/project/store');

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllProjects() {
	return testUtil.removeAllEntities('project');
}

describe('Project store', () => {
	/*
		* Test project store
		*/
	describe('upsert', () => {
		beforeEach(removeAllProjects);

		it('it should create a project', () => {
			const project = {
				name: 'myproject',
				location: 'madrid',
				date: new Date(),
				poster: 'poster/path',
				created_by: 'userId'
			};
			return projectStore.upsert(project)
				.then(createdProject => {
					console.log("project created ", createdProject);
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					delete projects[0]._id;
					delete projects[0].creation_date;
					delete projects[0].modification_date;
					console.log("expected ", project);
					console.log("actual", projects[0]);
					projects[0].should.deep.equal(project); // _id
				});
		});

		it('it should assign a id if not provided', () => {
			const project = {
				name: 'myproject',
			};
			return projectStore.upsert(project)
				.then(createdProject => {
					console.log("project created ", createdProject);
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					projects[0].should.have.property('_id');
				});
		});

		it('it should set creation and modification date on a new project', () => {
			const project = {
				name: 'newproject',
			};
			return projectStore.upsert(project)
				.then(createdProject => {
					console.log("project created ", createdProject);
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					delete projects[0]._id;
					projects[0].should.have.property("creation_date");
					projects[0].should.have.property("modification_date");
				});
		});

	});

});
process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const projectStore = require('../../../components/project/store');
const projectCtrl = require('../../../components/project');
const config = require('../../../config');

const testUtil = require('../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllProjects() {
	return testUtil.removeAllEntities('project');
}

describe('Project controller', () => {
	/*
		* Test project store
		*/
	describe('add', () => {
		beforeEach(removeAllProjects);
		// afterEach(removeAllProjects);

		it('it should create a project', () => {
			const project = {
				uuid: 'projectId',
				name: 'myproject',
				location: 'madrid',
				date: new Date(),
				poster: 'poster/path',
				created_by: 'userId'
			};
			return projectCtrl.add(project)
				.then(createdProjectId => {
					console.log("project created ", createdProjectId);
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						projects[0].id = projects[0]._id;
					}
					delete projects[0]._id;
					delete projects[0].creation_date;
					delete projects[0].modification_date;
					console.log("expected ", project);
					console.log("actual", projects[0]);
					projects[0].should.deep.equal(project); // _id
				});
		});

		it('it should assign a id if not present', () => {
			const project = {
			};
			return projectCtrl.add(project)
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

		it('it should assign a user if present', () => {
			const project = {
			};
			const user = { _id: 'userId' };
			return projectCtrl.add(project, user)
				.then(createdProject => {
					console.log("project created ", createdProject);
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					projects[0].should.have.property('created_by');
					projects[0]['created_by'].should.equal(user._id);
				});
		});

		it('it should not assign a user if not present', () => { // TODO(jliarte): 14/07/18 change to throw error?
			const project = {
			};
			return projectCtrl.add(project)
				.then(createdProject => {
					console.log("project created ", createdProject);
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					projects[0].should.not.have.property('created_by');
				});
		});

		it('it should return created project', () => {
			let createdProject;
			const project = {
				uuid: 'projectId',
				name: 'myproject',
				location: 'madrid',
				date: new Date(),
				poster: 'poster/path',
				created_by: 'userId'
			};
			return projectCtrl.add(project)
				.then(result => {
					console.log("project created ", result);
					createdProject = result;
					return projectStore.list();
				})
				.then(projects => {
					console.log("retrieved projects are ", projects);
					projects.should.have.length(1);
					if (config.persistence_db != 'datastore') {
						projects[0].id = projects[0]._id;
					}
					delete projects[0].creation_date;
					delete projects[0].modification_date;
					console.log("expected ", createdProject);
					console.log("actual", projects[0]);
					projects[0].should.deep.equal(createdProject); // _id
				});
		});

	});

});
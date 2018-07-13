process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const projectStore = require('../../../components/project/store');
const projectCtrl = require('../../../components/project');
const datastore = require('../../../store/datastore');
const config = require('../../../config');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllProjects() {
	return projectStore.list() // TODO(jliarte): 13/07/18 insert { limit: } ?
		.then((projects) => {
			if (projects && projects.length > 0) {
				console.log("retrieved projects is ", projects);
				const ids = projects.map( project => project._id );
				return datastore._removeMulti('project', ids).then(res => console.log("res deleting projects ", res));
			}
			return Promise.resolve();
		});
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

		// it('it should assign a id if not provided', () => {
		// 	const project = {
		// 		name: 'myproject',
		// 	};
		// 	console.log("calling project store upsert with project ", project);
		//
		// 	return projectStore.upsert(project)
		// 		.then(createdProject => {
		// 			console.log("project created ", createdProject);
		// 			return projectStore.list();
		// 		})
		// 		.then(projects => {
		// 			console.log("retrieved projects are ", projects);
		// 			projects.should.have.length(1);
		// 			projects[0].should.have.property('_id');
		// 		});
		// });
		//
		// it('it should set creation and modification date on a new project', () => {
		// 	const project = {
		// 		name: 'newproject',
		// 	};
		// 	console.log("calling project store upsert with project ", project);
		//
		// 	return projectStore.upsert(project)
		// 		.then(createdProject => {
		// 			console.log("project created ", createdProject);
		// 			return projectStore.list();
		// 		})
		// 		.then(projects => {
		// 			console.log("retrieved projects are ", projects);
		// 			projects.should.have.length(1);
		// 			delete projects[0]._id;
		// 			projects[0].should.have.property("creation_date");
		// 			projects[0].should.have.property("modification_date");
		// 		});
		// });

		// it('it should create a project with id', () => {
		// 	const project = {
		// 		name: 'myproject',
		// 		id: 'random-uuuis-fdsgsd-fdsdg'
		// 	};
		// 	console.log("calling project store upsert with project ", project);
		//
		// 	return projectStore.upsert(project)
		// 		.then(createdProject => {
		// 			console.log("project created ", createdProject);
		// 			return projectStore.list();
		// 		})
		// 		.then(projects => {
		// 			console.log("retrieved projects are ", projects);
		// 			projects.should.have.length(1);
		// 			console.log("expected ", project);
		// 			console.log("actual", projects[0]);
		// 			projects[0].should.deep.equal(project); // _id
		// 		});
		// });

		// it('it should not modify a created user after update', () => {
		// 	const user = {
		// 		email: 'email@email.com',
		// 		username: 'username',
		// 	};
		// 	let userId;
		// 	console.log("calling user store upsert with user ", user);
		//
		// 	return userStore.upsertAsync(user)
		// 		.then(res => {
		// 			console.log("user created ", res);
		// 			return userStore.listAsync({email: 'email@email.com'});
		// 		})
		// 		.then(users => {
		// 			console.log("retrieved users are ", users);
		// 			users.should.have.length(1);
		//
		// 			userId = users[0]._id;
		// 			return userStore.getAsync(userId);
		// 		})
		// 		.then(retrievedUser => {
		// 			retrievedUser.username = 'new username';
		// 			retrievedUser.id = userId;
		// 			return userStore.upsertAsync(retrievedUser);
		// 		})
		// 		.then(() => {
		// 			return userStore.getAsync(userId).should.eventually.deep.equal(
		// 				{ email: 'email@email.com', username: 'new username' });
		// 		});
		// });

	});

	// describe('User component add', () => {
	// 	// beforeEach(removeAllUsersAsync);
	//
	// 	it('it should not create non existent fields', () => {
	// 		const user = {
	// 			email: 'email@email.com',
	// 			username: 'username'
	// 		};
	//
	// 		return userComponent.addAsync(user, null)
	// 			.then(res => {
	// 				return userStore.listAsync({});
	// 			})
	// 			.then(users => {
	// 				users.should.have.length(1);
	// 				const userId = users[0]._id;
	//
	// 				return userStore.getAsync(userId).should.eventually.deep.equal(
	// 					{ email: 'email@email.com', username: 'username' });
	// 			});
	// 	});
	//
	// });

	// describe('User component update', () => {
	// 	beforeEach(removeAllUsersAsync);
	//
	// 	it('it should not change password if not provided', () => {
	// 		const user = {
	// 			email: 'email@email.com',
	// 			username: 'username',
	// 			password: 'pass'
	// 		};
	// 		let userId;
	// 		let storedPassword;
	// 		let storedUser;
	//
	// 		return userComponent.addAsync(user, null)
	// 			.then(() => {
	// 				return userStore.listAsync({});
	// 			})
	// 			.then(users => {
	// 				users.should.have.length(1);
	// 				userId = users[0]._id;
	// 				storedPassword = users[0].password;
	//
	// 				return userStore.getAsync(userId);
	// 			})
	// 			.then(retrievedUser => {
	// 				storedUser = retrievedUser;
	// 				storedUser.id = userId;
	// 				storedUser.username = 'new_username';
	// 				return userComponent.updateAsync(storedUser, user);
	// 			})
	// 			// TODO(jliarte): explore multiArgs (& filter)
	// 			.then((res, msg, status) => {
	// 				// check user fields
	// 				console.log("Res of update is ", res, status);
	// 				console.log("msg of update is ", msg);
	// 				return userStore.getAsync(userId).should.eventually.have.property('password').and.equal(storedPassword);
	// 			});
	// 	});
	//
	// 	it('it should not change not specified fields', () => {
	// 		const user = {
	// 			email: 'email@email.com',
	// 			username: 'username'
	// 		};
	// 		let userId;
	// 		let storedUser;
	//
	// 		return userComponent.addAsync(user, null)
	// 			.then(() => {
	// 				return userStore.listAsync({});
	// 			})
	// 			.then(users => {
	// 				users.should.have.length(1);
	// 				userId = users[0]._id;
	//
	// 				return userStore.getAsync(userId);
	// 			})
	// 			.then(retrievedUser => {
	// 				storedUser = retrievedUser;
	// 				storedUser.id = userId;
	// 				storedUser.username = 'new_username';
	// 				return userComponent.update(storedUser, user);
	// 			})
	// 			.then((res, msg, status) => {
	// 				// check user fields
	// 				console.log("Res of update is ", res, status);
	// 				console.log("msg of update is ", msg);
	// 				delete storedUser.id;
	// 				return userStore.getAsync(userId).should.eventually.deep.equal(storedUser);
	// 			});
	// 	});
	//
	// });

});
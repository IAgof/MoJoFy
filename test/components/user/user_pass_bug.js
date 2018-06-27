//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let userStore = require('../../../components/user/store');
let userComponent = require('../../../components/user');
let User = require('../../../components/user/model');

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();

function removeAllUsers(done) {
	//Before each test we empty the database
	userStore.list({}, (users) => {
		if (users.length == 0) {
			return done();
		}
		let userLenght = users.length;
		console.log("removing existing users ", userLenght, users);
		users.forEach(user => userStore.removeId(user._id, res => { if (--userLenght === 0) {return done()}}));
	});
}

describe('Users', () => {
	// beforeEach(removeAllUsers);
	/*
		* Test and explore the bug of user password changes
		*/
	describe('User store upsert', () => {
		beforeEach(function(done) {
			removeAllUsers(done);
		});

		it('it should create a user', (done) => {
			const user = {
				email: 'email@email.com',
				username: 'username',
			};
			console.log("calling user store upsert with user ", user);

			userStore.upsert(user, res => {
				console.log("user created ", res);
				console.log("res created ", res);
				userStore.list({}, users => {
					console.log("retrieved users are ", users);
					users.should.have.length(1);
					delete users[0]._id;
					console.log("expected ", user);
					console.log("actual", users[0]);
					users[0].should.deep.equal(user); // _id
					done();
				});
			});
		});

		it('it should not modify a created user after update', (done) => {
			const user = {
				email: 'email@email.com',
				username: 'username',
			};
			console.log("calling user store upsert with user ", user);

			userStore.upsert(user, res => {
				console.log("user created ", res);
				userStore.list({email: 'email@email.com'}, users => {
					console.log("retrieved users are ", users);
					users.should.have.length(1);

					const userId = users[0]._id;
					userStore.get(userId, retrievedUser => {
						retrievedUser.username = 'new username';
						retrievedUser.id = userId;
						userStore.upsert(retrievedUser, res => {
							userStore.get(userId, newRes => {
								console.log("last retrieved result is ", newRes);
								newRes.should.deep.equal({email: 'email@email.com', username: 'new username'});
								done();
							});
						});
					});
				});
			});
		});

	});

	describe('User component add', () => {
		beforeEach(function (done) {
			removeAllUsers(done);
		});

		it('it should not create non existent fields', (done) => {
			const user = {
				email: 'email@email.com',
				username: 'username'
			};

			userComponent.add(user, null, res => {
				userStore.list({}, users => {
					users.should.have.length(1);
					const userId = users[0]._id;

					userStore.get(userId, retrievedUser => {
						retrievedUser.should.deep.equal({
							email: 'email@email.com',
							username: 'username'
						});
						done();
					});
				});
			});
		});

	});

	describe('User component update', () => {
		beforeEach(function (done) {
			removeAllUsers(done);
		});

		it('it should not change password if not provided', (done) => {
			const user = {
				email: 'email@email.com',
				username: 'username',
				password: 'pass'
			};

			userComponent.add(user, null, res => {
				userStore.list({}, users => {
					users.should.have.length(1);
					const userId = users[0]._id;
					const storedPassword = users[0].password;

					userStore.get(userId, retrievedUser => {
						retrievedUser.id = userId;
						retrievedUser.username = 'new_username';
						userComponent.update(retrievedUser, user, (res, msg, status) => {
							// check user fields
							console.log("Res of update is ", res, status);
							console.log("msg of update is ", msg);
							userStore.get(userId, updatedUser => {
								delete retrievedUser.id;
								updatedUser.password.should.equal(storedPassword);
								updatedUser.should.deep.equal(retrievedUser);
								done();
							});
						});
					});
				});
			});
		});

		it('it should not change not specified fields', (done) => {
			const user = {
				email: 'email@email.com',
				username: 'username'
			};

			userComponent.add(user, null, res => {
				userStore.list({}, users => {
					users.should.have.length(1);
					const userId = users[0]._id;

					userStore.get(userId, retrievedUser => {
						retrievedUser.id = userId;
						retrievedUser.username = 'new_username';
						userComponent.update(retrievedUser, user, (res, msg, status) => {
							// check user fields
							console.log("Res of update is ", res, status);
							console.log("msg of update is ", msg);
							userStore.get(userId, updatedUser => {
								delete retrievedUser.id;
								updatedUser.should.deep.equal(retrievedUser);
								done();
							});
						});
					});
				});
			});
		});

	});

});
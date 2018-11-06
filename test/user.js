// //During the test the env variable is set to test
// process.env.NODE_ENV = 'test';
//
// // let mongoose = require("mongoose");
// let userStore = require('../components/user/store');
// let User = require('../components/user/model');
//
// //Require the dev-dependencies
// let chai = require('chai');
// let chaiHttp = require('chai-http');
// let server = require('../server');
// let should = chai.should();
//
// chai.use(chaiHttp);
//
// const testUtil = require('./test-util');
//
// function removeAllUsers() {
//   return testUtil.removeAllEntities('user');
// }
//
// describe('Users', () => {
// 	// beforeEach((done) => { //Before each test we empty the database
// 	// 	userStore.list({}, (users) => {
// 	// 		if (users.length == 0) {
// 	// 			return done();
// 	// 		}
// 	// 		let userLenght = users.length;
// 	// 		console.log("removing existing users ", userLenght, users);
// 	// 		users.forEach(user => userStore.removeId(user._id, res => { if (--userLenght === 0) {done()}}));
// 	// 	});
// 	// });
// 	beforeEach(removeAllUsers);
//
// 	describe('/GET user', () => {
// 		xit('it should GET all the users', (done) => { // TODO(jliarte): 24/09/18 now returns a 401, implement testing without Acl
// 			chai.request(server)
// 				.get('/user/')
// 				.end((err, res) => {
// 					res.should.have.status(200);
// 					res.body.should.be.a('array');
// 					res.body.length.should.be.eql(0);
// 					done();
// 				});
// 		});
// 	});
//
// });
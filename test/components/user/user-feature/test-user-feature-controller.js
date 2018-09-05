// test/components/user/user-feature/test-user-feature-controller.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test
const userFeatureStore = require('../../../../components/user/user-feature/store');
const userFeatureCtrl = require('../../../../components/user/user-feature');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllUserFeatures() {
	return testUtil.removeAllEntities('user-feature');
}

describe('UserFeature controller', () => {
	describe('add', () => {
		beforeEach(removeAllUserFeatures);

		it('should create an user feature', () => {
			const userFeature = {
				id: 'userFeatureId',
				name: 'userFeature name',
				description: 'desc',
				enabled: true
			};
			return userFeatureCtrl.add(userFeature)
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.list();
				})
				.then(userFeatures => {
					console.log("retrieved userFeatures are ", userFeatures);
					userFeatures.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(userFeatures[0]);
					console.log("expected ", userFeature);
					console.log("actual", userFeatures[0]);
					userFeatures[0].should.deep.equal(userFeature);
				});
		});

		it('should assign an id if not present', () => {
			const userFeature = {};
			return userFeatureCtrl.add(userFeature)
				.then(createdUserFeature => {
					console.log("userFeature created ", createdUserFeature);
					return userFeatureStore.list();
				})
				.then(userFeatures => {
					console.log("retrieved userFeatures are ", userFeatures);
					userFeatures.should.have.length(1);
					userFeatures[0].should.have.property('_id');
				});
		});

		it('should return created user feature', () => {
			let createdUserFeature;
			const userFeature = {
				id: 'userFeatureId',
				name: 'userFeature name',
				description: 'desc',
				enabled: true
			};
			return userFeatureCtrl.add(userFeature)
				.then(result => {
					console.log("userFeature created ", result);
					createdUserFeature = result;
					return userFeatureStore.list();
				})
				.then(userFeatures => {
					console.log("retrieved userFeatures are ", userFeatures);
					userFeatures.should.have.length(1);
					delete userFeatures[0].creation_date;
					delete userFeatures[0].modification_date;
					console.log("expected ", createdUserFeature);
					console.log("actual", userFeatures[0]);
					userFeatures[0].should.deep.equal(createdUserFeature);
				});
		});

	});

	describe('remove', () => {
		beforeEach(removeAllUserFeatures);

		it('should remove existing user feature', () => {
			const userFeature1 = {
				id: 'userFeatureId1',
			};
			const userFeature2 = {
				id: 'userFeatureId2',
			};
			return userFeatureCtrl.add(userFeature1)
				.then(result => {
					console.log("user feature created ", result);
					return userFeatureCtrl.add(userFeature2);
				})
				.then(result => {
					console.log("user feature created ", result);
					return userFeatureCtrl.remove(userFeature1.id);
				})
				.then(removedUserFeature => {
					removedUserFeature._id.should.equal(userFeature1.id);
					return userFeatureStore.list();
				})
				.then(userFeatures => {
					console.log("retrieved userFeatures are ", userFeatures);
					userFeatures.should.have.length(1);
					userFeatures[0]._id.should.equal(userFeature2.id);
				});
		});

	});

	describe('get', () => {
		beforeEach(removeAllUserFeatures);

		it('should return specified user feature by id', () => {
			const userFeature = {
				id: 'userFeatureId',
				name: 'userFeature name',
				description: 'desc',
				enabled: true
			};
			return userFeatureCtrl.add(userFeature)
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.get(createdUserFeature._id);
				})
				.then(retrievedUserFeature => {
					console.log("retrieved userFeature is ", retrievedUserFeature);
					testUtil.prepareRetrievedEntityToCompare(retrievedUserFeature);
					retrievedUserFeature.should.deep.equal(userFeature);
				});
		});

	});

	describe('query', () => {
		beforeEach(removeAllUserFeatures);

		it('should return specified user feature by userId', () => {
			const userFeature1 = {
				id: 'userFeatureId.1',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
			};
			const userFeature2 = {
				id: 'userFeatureId',
				name: 'userFeature2 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.2',
			};
			return userFeatureCtrl.add(userFeature1)
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureCtrl.add(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureCtrl.query({ userFeature: {userId: userFeature1.userId} });
				})
				.then(retrievedUserFeatures => {
					console.log("retrieved user features are  ", retrievedUserFeatures);
					retrievedUserFeatures.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedUserFeatures[0]);
					retrievedUserFeatures[0].should.deep.equal(userFeature1);
				});
		});

		it('should return specified user feature by userId and feature name', () => {
			const userFeature1 = {
				id: 'userFeatureId.1',
				name: 'userFeature1 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
			};
			const userFeature2 = {
				id: 'userFeatureId',
				name: 'userFeature2 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
			};
			return userFeatureCtrl.add(userFeature1)
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureCtrl.add(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureCtrl.query({ userFeature: { userId: userFeature1.userId, name: userFeature1.name } });
				})
				.then(retrievedUserFeatures => {
					console.log("retrieved user features are  ", retrievedUserFeatures);
					retrievedUserFeatures.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedUserFeatures[0]);
					retrievedUserFeatures[0].should.deep.equal(userFeature1);
				});
		});

	});


});
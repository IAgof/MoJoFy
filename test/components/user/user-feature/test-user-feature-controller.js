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

	describe('getDefaultsForPlan', () => {
		beforeEach(removeAllUserFeatures);

		it('should return default features for specified plan', () => {
			const userFeature1 = {
				id: 'userFeatureId.1',
				name: 'userFeature1 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
				plan: 'lite',
			};
			const userFeature2 = {
				id: 'userFeatureId',
				name: 'userFeature2 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
				plan: 'lite',
			};
			const defaultFeature1 = {
				id: 'defFeatureId1',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: 'default',
				plan: 'lite'
			};
			const defaultFeature2 = {
				id: 'defFeatureId2',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: 'default',
				plan: 'lite'
			};
			return userFeatureCtrl.add(userFeature1)
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.add(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.add(defaultFeature1);
				})
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.add(defaultFeature2);
				})
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.getDefaultsForPlan('lite');
				})
				.then(retrievedFeatures => {
					console.log("retrieved userFeature is ", retrievedFeatures);
					retrievedFeatures.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(retrievedFeatures[0]);
					testUtil.prepareRetrievedEntityToCompare(retrievedFeatures[1]);
					retrievedFeatures[0].should.deep.equal(defaultFeature1);
					retrievedFeatures[1].should.deep.equal(defaultFeature2);
				});
		});

	});

	describe('setPlanDefaultsToUser', () => {
		beforeEach(removeAllUserFeatures);

		it('should set default features for specified plan to specified userId', () => {
			const userId = 'userToTestId';
			const defaultFeature1 = {
				id: 'defFeatureId1',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: 'default',
				plan: 'lite'
			};
			const defaultFeature2 = {
				id: 'defFeatureId2',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: 'default',
				plan: 'lite'
			};
			return userFeatureCtrl.add(defaultFeature1)
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.add(defaultFeature2);
				})
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.setPlanDefaultsToUser(userId, 'lite');
				})
				.then(result => {
					console.log("result setting defaults for user ", result);
					return userFeatureCtrl.query({ userFeature: { userId: userId } })
				})
				.then(retrievedFeatures => {
					console.log("retrieved userFeature is ", retrievedFeatures);
					retrievedFeatures.should.have.length(2);
					testUtil.prepareRetrievedEntityToCompare(retrievedFeatures[0]);
					delete retrievedFeatures[0].id;
					delete defaultFeature1.id;
					defaultFeature1.userId = userId;
					retrievedFeatures[0].should.deep.equal(defaultFeature1);
					testUtil.prepareRetrievedEntityToCompare(retrievedFeatures[1]);
					delete retrievedFeatures[1].id;
					delete defaultFeature2.id;
					defaultFeature2.userId = userId;
					retrievedFeatures[1].should.deep.equal(defaultFeature2);
				});
		});

	});

	describe('removeUserFeatures', () => {
		beforeEach(removeAllUserFeatures);

		it('should remove all user features for specified userId', () => {
			const userId = 'userId';
			const defaultFeature1 = {
				id: 'defFeatureId1',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: userId,
				plan: 'lite'
			};
			const defaultFeature2 = {
				id: 'defFeatureId2',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: userId,
				plan: 'lite'
			};
			return userFeatureCtrl.add(defaultFeature1)
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.add(defaultFeature2);
				})
				.then(createdUserFeature => {
					console.log("userFeature created id ", createdUserFeature);
					return userFeatureCtrl.removeUserFeatures(userId);
				})
				.then(result => {
					console.log("result removing features for user ", result);
					return userFeatureCtrl.list(undefined)
				})
				.then(retrievedFeatures => {
					console.log("retrieved userFeature are ", retrievedFeatures);
					retrievedFeatures.should.have.length(0);
				});
		});

	});

});
// test/components/user/user-feature/test-user-feature-store.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const userFeatureStore = require('../../../../components/user/user-feature/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllUserFeatures() {
	return testUtil.removeAllEntities('user-feature');
}

describe('User Feature store', () => {
	describe('upsert', () => {
		beforeEach(removeAllUserFeatures);

		it('should create an user feature', () => {
			const userFeature = {
				id: 'userFeatureId',
				name: 'userFeature name',
				description: 'desc',
				enabled: true,
				userId: 'userId',
			};
			return userFeatureStore.upsert(userFeature)
				.then(createdUserFeature => {
					console.log("userFeature created ", createdUserFeature);
					return userFeatureStore.list();
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

		it('should assign an id if not provided', () => {
			const userFeature = {
				name: 'userFeature name',
			};
			return userFeatureStore.upsert(userFeature)
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

		it('should set creation and modification date on a new user feature', () => {
			const userFeature = {
				name: 'userFeature name',
			};
			return userFeatureStore.upsert(userFeature)
				.then(createdUserFeature => {
					console.log("userFeature created ", createdUserFeature);
					return userFeatureStore.list();
				})
				.then(userFeatures => {
					console.log("retrieved userFeatures are ", userFeatures);
					userFeatures.should.have.length(1);
					delete userFeatures[0]._id;
					userFeatures[0].should.have.property("creation_date");
					userFeatures[0].should.have.property("modification_date");
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
			return userFeatureStore.upsert(userFeature1)
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.upsert(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.query({ userFeature: {userId: userFeature1.userId} });
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
			return userFeatureStore.upsert(userFeature1)
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.upsert(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.query({ userFeature: { userId: userFeature1.userId, name: userFeature1.name } });
				})
				.then(retrievedUserFeatures => {
					console.log("retrieved user features are  ", retrievedUserFeatures);
					retrievedUserFeatures.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedUserFeatures[0]);
					retrievedUserFeatures[0].should.deep.equal(userFeature1);
				});
		});

		it('should return specified user features by plan', () => {
			const userFeature1 = {
				id: 'userFeatureId.1',
				name: 'userFeature1 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
				plan: 'free',
			};
			const userFeature2 = {
				id: 'userFeatureId',
				name: 'userFeature2 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
				plan: 'lite',
			};
			return userFeatureStore.upsert(userFeature1)
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.upsert(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.query({ userFeature: { plan: 'lite' } });
				})
				.then(retrievedUserFeatures => {
					console.log("retrieved user features are  ", retrievedUserFeatures);
					retrievedUserFeatures.should.have.length(1);
					testUtil.prepareRetrievedEntityToCompare(retrievedUserFeatures[0]);
					retrievedUserFeatures[0].should.deep.equal(userFeature2);
				});
		});

	});

	describe('removeMulti', () => {
		beforeEach(removeAllUserFeatures);

		it('should remove specified user features by id', () => {
			const userFeature1 = {
				id: 'userFeatureId.1',
				name: 'userFeature1 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
				plan: 'free',
			};
			const userFeature2 = {
				id: 'userFeatureId',
				name: 'userFeature2 name',
				description: 'desc',
				enabled: true,
				userId: 'userId.1',
				plan: 'lite',
			};
			return userFeatureStore.upsert(userFeature1)
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.upsert(userFeature2);
				})
				.then(createdUserFeature => {
					console.log("user feature created id ", createdUserFeature);
					return userFeatureStore.removeMulti( [userFeature1.id, userFeature2.id] );
				})
				.then(result => {
					console.log("result removing user features ", result);
					return userFeatureStore.list();
				})
				.then(userFeatures => {
					userFeatures.should.have.length(0);
				});
		});

	});


});
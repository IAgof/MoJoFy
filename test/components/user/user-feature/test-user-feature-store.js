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

});
process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const compositionStore = require('../../../../components/project/composition/store');

const testUtil = require('../../../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllCompositions() {
	return testUtil.removeAllEntities('composition');
}

describe('Composition store', () => {
	describe('upsert', () => {
		beforeEach(removeAllCompositions);

		it('it should create a composition', () => {
			const composition = {
				id: 'compositionId',
				title: 'mycomposition',
				description: 'desc',
				remoteProjectPath: 'remote/prj/path',
				quality: 'poor',
				resolution: 'fhd',
				frameRate: '30',
				duration: 42,
				audioFadeTransitionActivated: true,
				videoFadeTransitionActivated: false,
				watermarkActivated: true,
				productType: 'p1,p2',
				poster: 'poster/parh',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return compositionStore.upsert(composition)
				.then(createdCompositionId => {
					console.log("composition created id", createdCompositionId);
					createdCompositionId.should.equal(composition.id);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					delete composition.id;
					delete compositions[0]._id;
					delete compositions[0].creation_date;
					delete compositions[0].modification_date;
					console.log("expected ", composition);
					console.log("actual", compositions[0]);
					compositions[0].should.deep.equal(composition); // _id
				});
		});

		it('it should assign a id if not provided', () => {
			const composition = {
				title: 'mycompo',
			};
			return compositionStore.upsert(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					compositions[0].should.have.property('_id');
				});
		});

		it('it should set creation and modification date on a new composition', () => {
			const composition = {
				name: 'newcomposition',
			};
			return compositionStore.upsert(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					delete compositions[0]._id;
					compositions[0].should.have.property("creation_date");
					compositions[0].should.have.property("modification_date");
				});
		});

	});

});
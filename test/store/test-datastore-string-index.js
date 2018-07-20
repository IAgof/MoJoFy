// test/store/test-datastore-string-index.js

process.env.NODE_ENV = 'test';
// During the test the env variable is set to test

const Bluebird = require('bluebird');
const PromisifierUtils = require('../../util/promisifier-utils');

const datastore = require('../../store/datastore');
const ds = Bluebird.promisifyAll(datastore, {promisifier: PromisifierUtils.noErrPromisifier});

const compositionStore = require('../../components/project/composition/store');
// const compositionCtrl = require('../../../../components/project/composition');
// const trackStore = require('../../../../components/project/track/store');
// const config = require('../../../../config');

const testUtil = require('../test-util');

//Require the dev-dependencies
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

function removeAllCompositions() {
	return testUtil.removeAllEntities('composition');
}

describe('Datastore', () => {
	describe('objects with string id', () => {
		beforeEach(removeAllCompositions);

		it('it should create a composition with string index', () => {
			let compositionId = 'compositionId';
			const composition = {
				id: compositionId,
				uuid: compositionId,
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
				poster: 'poster/path',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return ds.addAsync('composition', composition, composition.id)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
				});
		});

		it('it should update a composition by string index', () => {
			let compositionId = 'compositionId';
			const composition = {
				id: compositionId,
				uuid: compositionId,
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
				poster: 'poster/path',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return compositionStore.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.list();
				})
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					composition.title = 'changed title';
					return compositionStore.upsert(composition);
				})
				.then(() => compositionStore.list())
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(1);
					compositions[0].title.should.equal('changed title');
				});
		});

		it('it should get a composition by string index', () => {
			let compositionId = 'compositionId';
			const composition = {
				id: compositionId,
				uuid: compositionId,
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
				poster: 'poster/path',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return compositionStore.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.get(compositionId);
				})
				.then(res => {
					console.log("retrieved composition is ", res);
					delete res.creation_date;
					delete res.modification_date;
					delete composition.id;
					res.should.deep.equal(composition);
				});
		});

		it('it should delete a composition by string index', () => {
			let compositionId = 'compositionId';
			const composition = {
				id: compositionId,
				uuid: compositionId,
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
				poster: 'poster/path',
				projectId: 'projectId',
				date: new Date(),
				created_by: 'userId'
			};
			return compositionStore.add(composition)
				.then(createdComposition => {
					console.log("composition created ", createdComposition);
					return compositionStore.remove(compositionId);
				})
				.then(() => compositionStore.list())
				.then(compositions => {
					console.log("retrieved compositions are ", compositions);
					compositions.should.have.length(0);
				});
		});

		// 	it('it should assign a id if not pr
	});

});
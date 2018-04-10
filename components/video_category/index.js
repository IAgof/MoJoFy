const Model = require('./model');

const categories = [
	Model.set({category: 'Events'}),
	Model.set({category: 'International'}),
	Model.set({category: 'National'}),
	Model.set({category: 'Politics'}),
	Model.set({category: 'Sports'}),
	Model.set({category: 'Incidents'}),
	Model.set({category: 'Culture'}),
	Model.set({category: 'Economy'}),
	Model.set({category: 'Health'}),
	Model.set({category: 'Tourism'}),
];

function list() {
// TODO(jliarte): harcoded by now, implement model retrieval when categories will be managed by admin
	return new Promise(resolve => {
		resolve(categories);
	});
}

module.exports = {
	list
};

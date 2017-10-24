
const Controller = ('./index');
const Store = require('./store');


exports.proccess = function() {
	//
	Store.getUpdated(function(updated) {

		for (var i = 0; i < updated.length; i++) {
			Store.getUpdates(updated[i], function() {
				//
			})
		};

	});
};

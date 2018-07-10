function noErrPromisifier(originalMethod) {
	return function promisified() {
		var args = [].slice.call(arguments);
		// Needed so that the original method can be called with the correct receiver
		var self = this;
		// which returns a promise
		return new Promise(function(resolve, reject) {
			args.push(resolve);
			originalMethod.apply(self, args);
		});
	};
}

module.exports = {
	noErrPromisifier
};
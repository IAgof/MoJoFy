// Logger

const self = {
	log: log,
	warn: warning,
	warning: warning,
	error: error,
	err: error
};

function error(data, silentDate) {
	
	if(!silentDate) {
		common('error');
	}

	console.error(data);
}

function warning(data, silentDate) {
	
	if(!silentDate) {
		common('error');
	}

	console.warn(data);
}

function log(data, silentDate) {
	
	if(!silentDate) {
		common('error');
	}

	console.log(data);
}


function common(level, data) {

	const d = new Date();
	const s = '['+ d.getFullYear() +'-'+ (d.getMonth() + 1) +'-'+ d.getDate() +']';

	if(typeof(data) === 'string') {
		self[level](s + ' ' + data, true);
	} else {
		self[level](s, true);
		self[level](data, true);
	}
}


module.exports = self;

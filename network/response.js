
const statusMessage = {
	'200': 'Done',
	'201': 'Created',
	'400': 'Invalid format',
	'401': 'Unauthenticated',
	'403': 'Forbidden',
	'404': 'Not found',
	'500': 'Internal error'
};


exports.success = function(req, res, next, code, data) {
	res.status(code || 200).send(data || statusMessage[code]);
};

exports.error = function(req, res, next, code, message) {
	res.status(code || 500).send({error: message || statusMessage[code]});
};


/* --------------------------------------------------------------------------- */


// THIS SHALL GO OUT, BUT... Might legacy code...
exports.response = function (req, res, next, resp) {
	
	if(typeof(resp) === 'undefined' || typeof(resp.status) === 'undefined') {

		// console.log('Invalid response arrived:');
		// console.error(resp);
		res.status(500).send({status:'error', error:'UnexpectedError', message:'There have been an unexpected error proccessing your request. The server response was invalid. Your request may be proceesed or may not.'});

	} else {

		if(resp.status !== 'error' && resp.data !== undefined) {
			if(typeof(resp.data) === 'number') {
				res.send('' + resp.data);
			} else {
				res.send(resp.data);
			}
		} else {
			res.send(resp);
		}
	}
};

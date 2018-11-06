const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const cors = require('cors');
const logger = require('./logger')(module);
const checkJwt = require('./components/access/auth0-middleware');
const auth0User = require('./components/access/auth0-user.middleware');

const Config = require('./config');
const Routes = require('./network/routes');

const server = express();

server.use(cors());

server.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	next();
});

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const port = Config.port;

server.use(checkJwt, function (err, req, res, next) {
	// (jliarte): 5/07/18 avoid JWT expired error!!
	// see https://github.com/auth0/express-jwt/issues/194
	if (err.code === 'invalid_token') return next();
	return next(err);
});
server.use(auth0User);

// Router
Routes(server);

// TODO(jliarte): 28/06/18 generic error catcher, maybe extract/improve this middleware
server.use(function (err, req, res, next) {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	logger.debug(err);
	res.status(err.status || 500).json({ error: err.message || err });
});

server.listen(port);
console.log('Server listening on port ' + port);

module.exports = server;

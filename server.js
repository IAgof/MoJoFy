const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const cors = require('cors');
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

// server.use(jwt({
// 	secret: Config.jwt_secret,
// 	issuer: Config.jwt_issuer,
// 	credentialsRequired: false
// }));

const port = Config.port;

server.use(checkJwt);
server.use(auth0User);

// Router
Routes(server);
// server = Routes(server);

// TODO(jliarte): 28/06/18 generic error catcher, maybe extract/improve this middleware
server.use(function (err, req, res, next) {
	console.log(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status || 500).json({ error: err.message });
});

server.listen(port);
console.log('Server listening on port ' + port);

module.exports = server;

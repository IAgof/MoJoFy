const express = require('express');
const bodyParser = require('body-parser');
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

server.listen(port);
console.log('Server listening on port ' + port);
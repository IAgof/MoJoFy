const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const cors = require('cors');

const Config = require('./config');

if (Config.persistence_db === 'dynamo' || Config.cloud_storage === 'aws') {
	const AWS = require('aws-sdk');

	AWS.config = new AWS.Config({
		//	endpoint: "http://localhost:8000",
		accessKeyId: Config.aws_accessKey,
		secretAccessKey: Config.aws_secretKey,
		region: Config.aws_region
	});
}

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

server.use(jwt({
	secret: Config.jwt_secret,
	issuer: Config.jwt_issuer,
	credentialsRequired: false
}));

const port = Config.port;

// Router
Routes(server);
// server = Routes(server);

server.listen(port);
console.log('Server listening on port ' + port);

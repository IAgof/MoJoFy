/* jshint node: true */

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');

const Config = require('./config');
const Network = require('./network/routes');

const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use(jwt({
  secret: Config.jwt_secret,
  issuer: Config.jwt_issuer,
  credentialsRequired: false
}));

const port = Config.port;

// Router

Network(server);
// server = Network(server);

server.listen(port);
console.log('Server listening on port ' + port);


















// // var Restify = require('restify');
// var Express = require('express');

// // var Jwt = require('restify-jwt');
// // var TOKEN_SECRET = 'YOUR_JWT_SECRET_TOKEN';


// // var Secure = require('./secure/canI.js');
// var Network = require('./network/routes');

// var server = Express.createServer();

// Express.CORS.ALLOW_HEADERS.push( 'authorization' );
// server.use(Restify.CORS({ 
// 	headers: [ 
// 		'authorization'// , 
// 		// 'content-type', 
// 		// 'Access-Control-Request-Headers' 
// 	], 
// 	credentials: true,
// 	origins: ['*'] 
// }));
// server.use(Restify.fullResponse());

// server.use(Restify.queryParser());

// server.use(Restify.bodyParser({
//     maxBodySize: 0,
//     mapParams: false,
//     mapFiles: true,
//     keepExtensions: true,
//     uploadDir: './public',
//     // multiples: true,
//     // hash: 'sha1'
//  }));
// // server.use(Restify.bodyParser());
// server.use(CookieParser.parse);


// // Basic routing
// server = Network.routes(server);


// // Start listening
// server.listen(3000, function (err) {
//     if (err)
//         console.error(err);
//     else
//         console.log('App is ready at : localhost:3000');
//         //console.log('App is ready at : ' + port)
// });

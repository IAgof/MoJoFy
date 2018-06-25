/* jshint node: true */
const express = require('express');

const routes = function (server) {

	const component = function (name) { return '../components/'+ name +'/network'; };

	server.use('/', express.static('public'));
	server.use('/login', require(component('access')));
	server.use('/user', require(component('user')));
	// server.use('/static', require(component('files')));
	server.use('/video', require(component('video')));
	server.use('/client', require(component('client')));
	server.use('/distribute', require(component('distribute')));
	server.use('/project', require(component('project')));
	server.use('/asset', require(component('asset')));
	// server.use('/resource', require('../components/resource/network'));

	// nested routes
	require(component('project')).use('/:projectId/asset', require(component('asset')));

	return server;
};

module.exports = routes;

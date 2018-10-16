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
  server.use('/media', require(component('project/media')));
	server.use('/track', require(component('project/track')));
	server.use('/billing', require(component('billing')));
	// server.use('/resource', require('../components/resource/network'));

	// nested routes
	require(component('user')).use('/:userId/userFeature', require(component('user/user-feature')));

	require(component('project')).use('/:projectId/asset', require(component('asset')));
	require(component('project')).use('/:projectId/composition', require(component('project/composition')));
	require(component('project')).use('/:projectId/composition/:compositionId/track',
		require(component('project/track')));
	require(component('project')).use('/:projectId/composition/:compositionId/track/:trackId/media',
		require(component('project/media')));

	return server;
};

module.exports = routes;

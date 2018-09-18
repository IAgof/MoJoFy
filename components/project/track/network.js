// components/project/track/network.js

const Controller = require('./index');
const Config = require('../../../config');

const logger = require('../../../logger')(module);
const express = require('express');
const router = express.Router({ mergeParams: true });
const getUser = require("../../access/acl").getUser;

router.post('/', (req, res, next) => {
	let user = getUser(req);
	logger.info("POST track from user " + (user ? user._id : user));
	logger.debug("user is ", req.user);
	// TODO: don't overwrite? - track without project?
	req.body.compositionId = req.params.compositionId || undefined;
	if (!user) {
		// TODO(jliarte): 12/07/18 extract helper? - ACL?
		return res.status(401).json( { error: "Unauthorized!" } );
	}
	Controller.add(req.body, user)
		.then(createdTrack => {
			res.status(201).json(createdTrack);
		})
		.catch(next);
});

router.get('/', (req, res, next) => {
	Controller.list()
		.then((tracks) => {
			res.status(200).json(tracks);
		});
});

router.put('/:trackId', (req, res, next) => {
  let user = getUser(req);
  const trackId = req.params.trackId;
  logger.info("PUT track [" + trackId + "] from user " + (user ? user._id : user));
  // TODO: don't overwrite? - track without project?
  if (req.params.compositionId) {
    req.body.compositionId = req.params.compositionId; // (jliarte): 14/09/18 don't overwrite!!
  }
  req.body.id = trackId;
  if (!user) {
    // TODO(jliarte): 12/07/18 extract helper? - ACL?
    return res.status(401).json( { error: "Unauthorized!" } );
  }
  Controller.upsert(req.body, user)
    .then(updatedTrack => {
      res.status(201).json(updatedTrack);
    })
    .catch(next);
});

router.delete('/:trackId', (req, res, next) => {
  let user = getUser(req);
  logger.info("DELETE track [" + trackId + "] from user " + (user ? user._id : user));
  const trackId = req.params.trackId;
  if (!user) {
    // TODO(jliarte): 12/07/18 extract helper? - ACL?
    return res.status(401).json( { error: "Unauthorized!" } );
  }
  Controller.remove(trackId) // TODO(jliarte): 14/09/18 cascade support?
    .then(removedTrack => {
      res.status(201).json(removedTrack);
    })
    .catch(next);
});

router.use((err, req, res, next) => {
	logger.error(`Error in method ${req.method}: ${err.message}`);
	res.status(err.status).json({ error: err.message });
});

module.exports = router;
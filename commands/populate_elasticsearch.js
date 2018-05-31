const videoCommands = require('../components/video/commands')

videoCommands.createIndex()
	.then(videoCommands.populateElasticWithVideos())
	.then(console.log("done!"))
	.catch(e => {
		console.log("error");
		console.log(e)
	});
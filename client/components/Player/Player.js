// React stuff
import React from 'react';


const Player = ({img, video}) => (
	<div className="player">
		<video controls="controls">
			<source src={video} type="video/mp4" />
		</video>
		<span className="player-play"></span>
	</div>
);

export default Player;

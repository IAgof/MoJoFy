// React stuff
import React from 'react';


const Player = ({img}) => (
	<div className="player">
		<div style={{backgroundSize: 'cover', backgroundImage: 'url('+ img +')'}} />
		<span className="player-play"></span>
	</div>
);

export default Player;

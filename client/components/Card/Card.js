// React stuff
import React from 'react';

// Components
import Player from '../Player/Player';
// import { ListMenu, ListItem } from './ListMenu';

const Card = ({className, title, description, img, id}) => (
	<div className={ 'card card-' + (className || 'small') }>
		<div className="card-image" style={{backgroundSize: 'cover', backgroundImage: 'url('+ img +')'}}></div>
		<strong className="card-title">{title}</strong>
		<span className="card-description">{description}</span>
	</div>
);

export default Card;

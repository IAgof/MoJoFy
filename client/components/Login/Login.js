// Import react stuff
import React, { Component } from 'react';

// Import utils
import axios from 'axios';

import config from '../../config';

// Import components
// import Card from '../Card/Card';


class Login extends Component {

	constructor(props) {
		super(props);

		this.login = this.login.bind(this);

		// Check if is logged, and decide if load the component or go to other place.
		var storedState = localStorage.getItem('state');
		if(storedState) {
			storedState = JSON.parse(storedState);
		}

		if(storedState && storedState.auth && storedState.auth.isLogged) {
			console.log('Was logged. Redirecting to app...');
			document.location.hash = '#/';
		}

		// What about logout?
		console.log(this.props.match.params)
	}

	login(event) {
		event.preventDefault();
		let user = document.getElementById('login-user').value;
		let pass = document.getElementById('login-pass').value;
		console.log(user, pass);

		axios.post(config + '/login', {name: user, password: pass})
			.then(function(res) {
				console.log('done!!!');
				console.log(res);
				console.log(res.data);
				res.data.isLogged = true;
				localStorage.setItem('state', JSON.stringify({auth: res.data}));
			})
			.catch(function(err) {
				console.error('Error on login request:');
				console.error(err);
				localStorage.setItem('state', JSON.stringify({auth: {isLogged: false}}));
			});
	}

	render() {
		return (

			<div className="login">
				<h1>Entrar</h1>
				<form onSubmit={this.login}>
					User: <input id="login-user" type="text" name="user" /><br />
					Pass: <input id="login-pass" type="password" name="password" /><br />
					<input type="submit" name="Login" />
				</form>
			</div>

		);
	}
}

export default Login;
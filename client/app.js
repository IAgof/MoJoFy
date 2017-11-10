// Import react stuff
import React, { Component } from 'react';
import { Redirect, Router, Route, Switch, hashHistory, MemoryRouter } from 'react-router';

// Import utils
import axios from 'axios';
import createHashHistory from 'history/createHashHistory';


// Import components
import Login from './components/Login/Login';
import VideoList from './components/VideoList/VideoList';
import VideoDetail from './components/VideoDetail/VideoDetail';
import Error404 from './components/Error404/Error404';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    isAuthenticated() ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

function isAuthenticated() {
  var res = JSON.parse(localStorage.getItem('state'));
  
  if(!res) { 
    return false; 
  }

  if(!axios.defaults.headers.common['Authorization'] ) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.auth.token;
  }

  return true;
  // return (res.auth && res.auth && res.auth.isLogged);
}

class App extends Component {

  constructor(props) {
    super(props);

    // this.state = {
    //   isLoading: true,
    //   searchActive: false,
    //   videos: []
    // };
  }


  render() {

    const newHistory = createHashHistory();

    return (

        <Router history={newHistory}>
          <div className="app">
            
            <h1>Vimojo cloud backup</h1>

            <Switch>
              <Route exact path="/login/:redirect?" component={Login} />
              <PrivateRoute exact path="/video/:id" component={VideoDetail} />
              <PrivateRoute exact path="/" component={VideoList} />
              <Route component={Error404}/>
            </Switch>
          
          </div>
       </Router >

    );
  }
}

export default App;
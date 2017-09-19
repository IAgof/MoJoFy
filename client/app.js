// Import react stuff
import React, { Component } from 'react';
import { Router, Route, Switch, hashHistory, MemoryRouter } from 'react-router';

// Import utils
// import axios from 'axios';
import createHashHistory from 'history/createHashHistory';


// Import components
import VideoList from './components/VideoList/VideoList';
import VideoDetail from './components/VideoDetail/VideoDetail';
import Error404 from './components/Error404/Error404';


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
              <Route exact path="/" component={VideoList} />
              <Route exact path="/video/:id" component={VideoDetail} />
              <Route component={Error404}/>
            </Switch>
          
          </div>
       </Router >

    );
  }
}

export default App;
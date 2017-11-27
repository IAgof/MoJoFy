// Import react stuff
import React, { Component } from 'react';

// Import utils
import axios from 'axios';

import config from '../../config';


// Import components
import Card from '../Card/Card';


class VideoList extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      videos: []
    };

    this.getVideos = this.getVideos.bind(this);
  }

  componentDidMount() {
    this.getVideos();
  }

  getVideos() {
    var self = this;

    axios.get(config.api_url + '/video')
      .then(function(res) {
        var results = res.data;

        self.setState({
          isLoading: false,
          videos: results
        });
      })
      .catch(function(error) {
        console.error(error);
        this.setState({
          isLoading: false
        });
      });
  }

  render() {

    function cards(data) {
      
      let rows = [];
      
      for (let i=0; i < data.length; i++) {
          rows.push(<a key={data[i]._id} href={'#/video/' + data[i]._id}><Card title={data[i].title} description={data[i].description} img={data[i].poster} id={data[i]._id} /></a>);
      }

      return <div className="video-list-cards">{rows}</div>;
    }

    return (

      <div className="video-list">
        { cards(this.state.videos) }
      </div>

    );
  }
}

export default VideoList;
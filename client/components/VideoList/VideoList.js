// Import react stuff
import React, { Component } from 'react';

// Import utils
import axios from 'axios';


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

    axios.get('http://localhost:3000/video')
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

   /* this.setState({
      videos: [
        {
          id: '12341',
          title: 'Video sin título 1',
          description: '',
          img: 'https://storage.googleapis.com/mojotest/poster/e8/d4/e8d40b27f59ce35936ba511440bc8f5e.png',
        },
        {
          id: '12342',
          title: 'Video sin título 2',
          description: '',
          img: 'https://storage.googleapis.com/mojotest/poster/e8/d4/e8d40b27f59ce35936ba511440bc8f5e.png',
        },
        {
          id: '12343',
          title: 'Video sin título 3',
          description: '',
          img: 'https://storage.googleapis.com/mojotest/poster/e8/d4/e8d40b27f59ce35936ba511440bc8f5e.png',
        },
        {
          id: '12344',
          title: 'Video sin título 4',
          description: '',
          img: 'https://storage.googleapis.com/mojotest/poster/e8/d4/e8d40b27f59ce35936ba511440bc8f5e.png',
        },
        {
          id: '12345',
          title: 'Video sin título 5',
          description: '',
          img: 'https://storage.googleapis.com/mojotest/poster/e8/d4/e8d40b27f59ce35936ba511440bc8f5e.png',
        }
      ]
    });*/

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
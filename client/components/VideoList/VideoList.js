// Import react stuff
import React, { Component } from 'react';

// Import utils
// import axios from 'axios';


// Import components
import Card from '../Card/Card';


class VideoList extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      videos: []
    };
  }

  componentDidMount() {
    this.getVideos();
  }

  getVideos() {
    
    // axios.get('https://api.themoviedb.org/3/movie/popular?api_key=fcc3e3e91b7cc38185ef902ca797ee11&page=1')
    //   .then(({ data: { results }}) => {
    //     console.log('resultados:', results);
    //     this.setState({
    //       isLoading: false,
    //       videos: results
    //     });
    //   })
    //   .catch(error => {
    //     console.log(error);
    //     this.setState({
    //       isLoading: false
    //     });
    //   });

    this.setState({
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
    });

  }

  render() {

    function cards(data) {
      
      let rows = [];
      
      for (let i=0; i < data.length; i++) {
          rows.push(<a href={'#/video/' + data[i].id}><Card key={i} title={data[i].title} description={data[i].description} img={data[i].img} id={data[i].id} /></a>);
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
// Import react stuff
import React, { Component } from 'react';

// Import utils
// import axios from 'axios';


// Import components
import Player from '../Player/Player';


class VideoDetail extends Component {


  constructor(props) {
    super(props);
    
    this.state = {
      video: null
    };
  }

  componentDidMount() {
    this.getVideo();
  }

  getVideo() {
    
    // axios.get('https://api.themoviedb.org/3/movie/popular?api_key=fcc3e3e91b7cc38185ef902ca797ee11&page=1')
    //   .then(({ data: { result }}) => {
    //     console.log('Respuesta:', result);
    //     this.setState({
    //       isLoading: false,
    //       video: result
    //     });
    //   })
    //   .catch(error => {
    //     console.log(error);
    //     this.setState({
    //       isLoading: false
    //     });
    //   });

    console.log(this.props.match);

    this.setState({
      video: this.findVideo(this.props.match.params.id)
    });
  }

  findVideo(id, callback) {
    const videos = [
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
    ];

    for (var i = videos.length - 1; i >= 0; i--) {
      if(videos[i].id == id) {
        return videos[i];
      }
    };
  }


  render() {
    return (

      <div>
      { this.state.video &&
        <div className="video-detail">
          <h2>{this.state.video.title}</h2>
          <div>{this.state.video.description}</div>

          <Player img={this.state.video.img} />
        </div>
      }
      </div>

    );
  }
}

export default VideoDetail;
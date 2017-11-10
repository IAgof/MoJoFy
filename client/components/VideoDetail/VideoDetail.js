// Import react stuff
import React, { Component } from 'react';

// Import utils
import axios from 'axios';


// Import components
import Player from '../Player/Player';


class VideoDetail extends Component {


  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      video: null
    };
    
    this.getVideo = this.getVideo.bind(this);
    this.removeVideo = this.removeVideo.bind(this);
  }

  componentDidMount() {
    this.getVideo();
  }

  getVideo() {
    var self = this;

    axios.get('http://localhost:3000/video/' + this.props.match.params.id)
      .then(function(res) {
        var results = res.data;

        self.setState({
          isLoading: false,
          video: results
        });
      })
      .catch(function(error) {
        console.error(error);
        this.setState({
          isLoading: false
        });
      });
  }

  removeVideo() {
    var self = this;

    if(confirm('¿Seguro que quieres eliminar el video? Esta acción es permanente.')) {
      axios.delete('http://localhost:3000/video/' + this.props.match.params.id)
        .then(function(res) {
          var results = res.data;

          self.setState({
            isLoading: false,
            video: results
          });
        })
        .catch(function(error) {
          console.error(error);
          this.setState({
            isLoading: false
          });
        });
    }
  }


  render() {
    return (

      <div>
      { this.state.video &&
        <div className="video-detail">
          <h2>{this.state.video.title || 'Video sin título'}</h2>
          <div>{this.state.video.description || ''}</div>
          <div>
            <a onClick={this.removeVideo}>Eliminar video</a>
          </div>

          <Player img={this.state.video.poster} />
        </div>
      }
      </div>

    );
  }
}

export default VideoDetail;
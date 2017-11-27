// Import react stuff
import React, { Component } from 'react';

// Import utils
import axios from 'axios';

import config from '../../config';

// Import components
import Player from '../Player/Player';


class VideoEdit extends Component {


  constructor(props) {
    super(props);
    
    this.state = {
      isLoading: true,
      video: {
        title: '',
        description: ''
      }
    };
    
    this.getVideo = this.getVideo.bind(this);
    this.editVideo = this.editVideo.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
  }

  componentDidMount() {
    this.getVideo();
  }

  getVideo() {
    var self = this;

    axios.get(config.api_url + '/video/' + this.props.match.params.id)
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

  editVideo() {
    var self = this;

    console.log(self.state.video);

    // if(confirm('¿Seguro que quieres eliminar el video? Esta acción es permanente.')) {
      axios.put(config.api_url + '/video', self.state.video)
      // axios.put('http://localhost:3000/video/' + this.props.match.params.id, self.state.video)
        .then(function(res) {
          console.log(res);
          document.location.hash = '#/video/' + self.state.video._id;
        })
        .catch(function(error) {
          console.error(error);
          this.setState({
            isLoading: false
          });
        });
    // }
  }

  updateTitle(evt) {
    var video = this.state.video;
    video.title = evt.target.value;

    this.setState({
      video: video
    });
  }

  updateDescription(evt) {
    var video = this.state.video;
    video.description = evt.target.value;

    this.setState({
      video: video
    });
  }

  render() {
    return (

      <div>
      { this.state.video &&
        <div className="video-detail">
          <div>
            Titulo: 
            <input type="text" value={this.state.video.title} onChange={this.updateTitle} />
          </div>
          <div>{this.state.video.title || ''}</div>
          <div>Descripcion: <textarea onChange={this.updateDescription} value={this.state.video.description}></textarea></div>
          <div>{this.state.video.description || ''}</div>
          <div>
            <a href={'#/video/'+ this.state.video._id}>Cancelar</a>
            <a onClick={this.editVideo}>Guardar</a>
          </div>

          <Player img={this.state.video.poster} video={this.state.video.video} />
        </div>
      }
      </div>

    );
  }
}

export default VideoEdit;
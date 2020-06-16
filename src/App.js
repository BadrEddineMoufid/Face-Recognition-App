import React, { Component } from 'react';
import Particles from 'react-particles-js';

import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/signin';
import Register from './components/Register/register';
import Logo from './components/Logo/logo';
import FaceRecognition from './components/FaceRecognition/facerecognition';
import ImageLinkForm from './components/ImageLinkForm/imagelinkform';
import Rank from './components/Rank/rank';
import './App.css';



const particlesOptions = {
  params:{
    polygon: {
        enable: true,
        type: 'inside',
        move: {
            radius: 30
        }
        
    }
  }
}

//init state
const initialState = {
    input: '',
    imageUrl:'',
    box:{},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  }

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  //setting state
  loadUser = (data) =>{
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  
  //calculating face box
  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');

    const width = Number(image.width);
    const height = Number(image.height);

    console.log(width, height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  //passing box 
  displayFaceBox = (box) =>{
    
    this.setState({box: box});
  }

  //handeling input change
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  //sending image to API for face recognition
  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input})
    fetch('https://dry-refuge-71564.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
        //updating user user entries
        if(response){
          fetch('https://dry-refuge-71564.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            //updating state with the new num of entries from API
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(err=>console.log(err))
        }
        //displaying the box arround face
        this.displayFaceBox(this.calculateFaceLocation(response))})
      .catch(err => console.log(err));
  }

  //handeling signin and singout
  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />

        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />

        {this.state.route === 'home' ? 
            <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
            </div>
          :
          (
            this.state.route === 'signin' 
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;

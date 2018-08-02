import React, { Component } from 'react';
import './App.css';

import Conversion from './components/conversion.js';


class App extends Component {

  render() {
    return (
      <div>
        <h1>Currency converter</h1>
        <Conversion />
      </div>
    )
  }
}

export default App;

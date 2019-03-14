import React, { Component } from 'react';
import './App.css';
import ClusterViz from './ClusterViz';

class App extends Component {
  render() {
    return (
      <div className="App">
        <svg width="1000" height="600">
          <ClusterViz width={1000} height={600}/>
        </svg>
      </div>
    );
  }
}

export default App;

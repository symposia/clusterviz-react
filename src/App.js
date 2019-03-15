import React, { Component } from "react";
import "./App.css";
import ClusterViz from "./ClusterViz";

class App extends Component {
  render() {
    return (
      <div className="App">
        <ClusterViz width={1000} height={600} />
      </div>
    );
  }
}

export default App;

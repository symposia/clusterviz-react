import React, { Component } from 'react';
import * as d3 from 'd3';

class ClusterViz extends Component {
  state = {
    data: null
  }

  componentDidMount() {
    const dataURL = "/data/huawei.json"
    d3.json(dataURL).then((data) => {
      this.setState({data})
    })
  }

  componentDidUpdate() {
    console.log(this.state.data)
  }

  render() {
    return null;
  }
}

export default ClusterViz;
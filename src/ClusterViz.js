import React, { Component } from "react";
import * as d3 from "d3";
import $ from "jquery";

import "./ClusterViz.css";

class ClusterViz extends Component {
  state = {
    data: null
  };

  componentDidMount() {
    const dataURL = "/data/huawei.json";
    d3.json(dataURL).then(data => {
      this.setState({ data });
    });
  }

  componentDidUpdate() {
    this.setupVisiaulization();
  }

  render() {
    const data = this.state.data;

    if (!data) {
      return null;
    }

    return (
      <div>
        <svg width="1000" height="600">
          <g ref="anchor" />
        </svg>
        <button id="reset-zoom" class="my-btn">
          Reset Zoom
        </button>
        <div id="tooltip-container" className="second" />
        <div id="filter-container" className="dropdown-list">
          <input
            type="search"
            placeholder="Search Sources"
            class="dropdown-search"
          />
          <ul id="news-sources-filter-list" />
          <button
            class="my-btn reset-btn"
            type="text"
            placeholder=""
            aria-label="reset filters"
            aria-describedby="basic-addon1"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  setupVisiaulization() {
    const nodes = Object.values(this.state.data);
    var typeFilterList;

    const width = this.props.width;
    const height = this.props.height;

    const scale = 0.25;
    const zoomWidth = (width - scale * width) / 2;
    const zoomHeight = (height - scale * height) / 2;
    const highlight_trans = 0.1;
    const fill = d3.scaleOrdinal(d3.schemeCategory10);

    function set_focus() {
      nodeImages.style("opacity", function(o) {
        return typeFilterList.includes(o.sourceName) ? 1 : highlight_trans;
      });
    }

    // Outermost Container
    const svg = d3.select(this.refs.anchor);
    svg
      .style("overflow", "scroll")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "container--fluid");

    const gMain = svg.append("g");
    gMain.attr("class", "g-main");

    const rect = gMain.append("rect");
    rect
      .attr("width", width)
      .attr("height", height)
      .style("fill", "white");

    const gDraw = gMain.append("g");

    function zoomed() {
      if (gDraw) {
        gDraw.attr("transform", d3.event.transform);
      }
    }

    const transform = d3.zoomIdentity.translate(25, 100).scale(0.2);

    const zoom = d3
      .zoom()
      .scaleExtent([0.05, 5])
      .on("zoom", zoomed);

    gDraw.call(zoom.transform, transform);

    gMain.call(zoom);
    gMain.call(zoom.transform, transform);

    function getDomain(url) {
      var result;
      var match;
      if (
        (match = url.match(
          /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im
        ))
      ) {
        result = match[1];
        if ((match = result.match(/^[^\.]+\.(.*\..*\..+)$/))) {
          result = match[1];
        }
      }
      return result;
    }

    //reset zoom button
    function resetZoom() {
      gMain
        .transition()
        .duration(750)
        .call(zoom.transform, transform);
    }

    const tooltip = d3.select(".second");
    tooltip
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const nodeImages = gDraw
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("svg:g")
      .attr("class", "node")
      .append("svg:image")
      .attr("xlink:href", function(d) {
        return "http://logo.clearbit.com/" + getDomain(d.url);
      })
      .attr("height", 50)
      .attr("width", 50)
      .attr("x", function(d) {
        return d.x;
      })
      .attr("y", function(d) {
        return d.y;
      })
      .attr("r", 30)
      .style("fill", function(d) {
        return fill(d.clust);
      })
      .style("stroke", function(d) {
        return d3.rgb(fill(d.clust)).darker(2);
      });

    const gNodes = d3.selectAll("g.node");

    function selectNode(d) {
      const s = 4;
      const x = s * (-d["x"] + 523);
      const y = s * (-d["y"] + 106);
      gNodes
        .transition()
        .duration(750)
        .attr("transform", "translate(" + x + "," + y + ") scale(" + s + ")");
    }

    console.log(nodeImages);

    nodeImages.on("click", function(d) {
      resetZoom();
      if (this.classList.contains("highlighted")) {
        // Zoom Out and remove highlight
        gNodes
          .transition()
          .duration(750)
          .attr("transform", "");
        this.classList.remove("highlighted");
        // Hide Tooltip
        tooltip
          .transition()
          .duration(50)
          .style("opacity", 0)
          .style("pointer-events", null);

        tooltip.transition().style("visibility", "hidden");
      } else {
        // zoom in and highlight node
        selectNode(d);
        const highlightedElements = document.getElementsByClassName(
          "highlighted"
        );
        console.log(highlightedElements);
        if (highlightedElements.length > 0) {
          for (let el of highlightedElements) {
            console.log(el);
            el.classList.remove("highlighted");
          }
        }
        this.classList.add("highlighted");
        //show tooltip
        tooltip.transition().style("opacity", 1);
        tooltip
          .html(
            "<p>" +
              '<img class="logo-img" src="' +
              "http://logo.clearbit.com/" +
              getDomain(d.url) +
              '" height="52" width="52">' +
              "</p>" +
              "<p><a href=" +
              d.url +
              ">" +
              d.title +
              "</a>" +
              "</p>" +
              "<h4>" +
              "<b>Author: </b> King James</h4>" +
              "<h4>" +
              "<b>Date: </b> Jan 18, 2019</h4>" +
              "<h4>Description: blah blah blah<h4>"
          )
          .style("visibility", "visible");
      }
    });

    function tick(e) {
      var minx = 0,
        miny = 0;
      // Push different nodes in different directions for clustering.
      const k = this.alpha() * 20;
      nodes.forEach(function(o, i) {
        o.x += Math.floor(o.clust % 5) * k;
        o.y += Math.floor(o.clust / 5) * k;

        minx = Math.min(minx, o.x);
        miny = Math.min(miny, o.y);
      });

      nodes.forEach(function(o, i) {
        o.x -= minx - 10;
        o.y -= miny - 10;
      });

      nodeImages
        .attr("x", function(d) {
          return d.x;
        })
        .attr("y", function(d) {
          return d.y;
        });
    }

    // Force Simulation
    d3.forceSimulation(nodes)
      .nodes(nodes)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", tick);

    tooltip
      .on("mouseover", function() {
        tooltip.style("pointer-events", null);
      })
      .on("mouseleave", function() {});

    svg
      .style("opacity", 1e-6)
      .transition()
      .duration(1000)
      .style("opacity", 1);

    const resetZoomButton = document.getElementById("reset-zoom");
    resetZoomButton.addEventListener("click", event => {
      event.stopPropagation();
      gNodes
        .transition()
        .duration(750)
        .attr("transform", "");

      const highlightedElements = document.getElementsByClassName(
        "highlighted"
      );
      console.log(highlightedElements);
      if (highlightedElements.length > 0) {
        for (let el of highlightedElements) {
          console.log(el);
          el.classList.remove("highlighted");
        }
      }

      tooltip
        .transition()
        .duration(50)
        .style("opacity", 0)
        .style("pointer-events", null);

      tooltip.transition().style("visibility", "hidden");

      gMain
        .transition()
        .duration(750)
        .call(zoom.transform, transform);
    });

    filter(this.state.data);
    function filter(data) {
      var newsSources = [];
      var exists = [];
      var filtered = false;

      for (let el in data) {
        var node = data[el];
        if (!exists.includes(node.sourceName)) {
          exists.push(node.sourceName);
          newsSources.push({ sourceName: node.sourceName, url: node.url });
        }
      }

      typeFilterList = exists;
      console.log(typeFilterList);

      function stateTemplate(sourceName) {
        return (
          '<div class="list-item container__row">' +
          `<input class="cbx" id="${sourceName}"  name="${sourceName}" type="checkbox">` +
          `<label class="source-check" for="${sourceName}"><span class="slider"></span></label>` +
          `<div class="label-text">${sourceName}</div>` +
          "</div>"
        );
      }

      // Populate list with states
      newsSources.forEach(function(s) {
        document
          .getElementById("news-sources-filter-list")
          .insertAdjacentHTML("beforeend", stateTemplate(s.sourceName));
      });

      // Events
      const resetSourcesButton = document.querySelector(".reset-btn");
      resetSourcesButton.addEventListener("click", e => {
        e.stopPropagation();
        typeFilterList = exists;
        // $(":checkbox").prop("checked", false);
        const list = document.querySelectorAll("input[type=checkbox]");
        for (let item of list) {
          item.checked = false;
        }
        console.log(typeFilterList);
        filtered = false;
        set_focus();
      });

      const dropdownSearchInput = document.querySelector(".dropdown-search");
      dropdownSearchInput.addEventListener("input", function(e) {
        e.stopPropagation();
        var target = $(this);
        var dropdownList = target.closest(".dropdown-list");
        var search = target.val().toLowerCase();

        if (!search) {
          dropdownList.find(".label-text").show();
          return false;
        }

        dropdownList.find(".list-item").each(function() {
          var text = $(this)
            .text()
            .toLowerCase();
          var match = text.indexOf(search) > -1;
          $(this).toggle(match);
        });
      });

      document
        .querySelector(".dropdown-list")
        .addEventListener("change", function(e) {
          if (e.target.type === "checkbox") {
            if (!filtered) {
              typeFilterList = [];
              filtered = true;
            }

            if (e.target.checked) {
              typeFilterList.push(d3.select(e.target).attr("name"));
              set_focus();
            } else {
              typeFilterList.splice(typeFilterList.indexOf("foo"), 1);
              if (typeFilterList.length === 0) {
                typeFilterList = exists;
                filtered = false;
              }
              set_focus();
            }

            console.log(typeFilterList);
          }
          return false;
        });
    }
  }
}

export default ClusterViz;

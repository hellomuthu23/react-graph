import * as React from 'react';
import { Component } from 'react';

import EdgeComponent from './components/edge/edge';
import NodeComponent from './components/node/node';
import { Graph, GraphInputData } from './graph.models';
import GraphService from './graph.service';
import styles from './styles.module.css';

interface Props {
  graphInputData: GraphInputData;
}

interface State {
  graph: Graph;
}
export default class GraphComponent extends Component<Props, State> {
  graphService: GraphService;

  constructor(props: Props) {
    super(props);
    this.graphService = new GraphService();
    this.state = {
      graph: {
        nodes: [],
        edges: []
      }
    };
  }

  componentDidMount() {
    this.setState({
      graph: this.graphService.initializeGraph(this.props.graphInputData)
    });
  }

  render() {
    return (
      <div
        className={styles.graphContainer}
        style={getGraphStyle(this.state.graph)}
      >
        {this.state.graph.edges.map((edge, index) => (
          <EdgeComponent key={index} edge={edge} />
        ))}
        {this.state.graph.nodes.map((node, index) => (
          <NodeComponent key={index} node={node} />
        ))}
      </div>
    );
  }
}

const getGraphStyle = (graph: Graph) => {
  return {
    minWidth: graph.width + 'px',
    minHeight: graph.height + 'px',
    marginLeft: '5px'
  };
};

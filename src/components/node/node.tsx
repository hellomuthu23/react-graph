import * as React from 'react';
import { Component } from 'react';

import { Node } from './../../graph.models';
import styles from './../../styles.module.css';

interface Props {
  node: Node;
}

export default class NodeComponent extends Component<Props> {
  render() {
    return (
      <div style={getStyle(this.props.node)} className={styles.node}>
        Node Component: {this.props.node.id}
      </div>
    );
  }
}

const getStyle = (node: Node) => {
  return {
    left: node.position.x - node.dimension.width / 2 + 'px',
    top: node.position.y - node.dimension.height / 2 + 'px',
    height: node.dimension.height + 'px',
    width: node.dimension.width + 'px'
  };
};

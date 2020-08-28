import * as React from 'react';
import { Component } from 'react';

import { Edge } from './../../graph.models';
import styles from './../../styles.module.css';

interface Props {
  edge: Edge;
}

export default class EdgeComponent extends Component<Props> {
  render() {
    console.log(this.props.edge);
    return (
      <svg id='svg-canvas' className={styles.svgContainer}>
        <g>
          <g className={styles.edgePath}>
            <marker
              id='arrow-1'
              viewBox='-0 -5 10 10'
              refX='8'
              refY='0'
              markerWidth='5'
              markerHeight='5'
              orient='auto'
            >
              <path d='M0,-5L10,0L0,5' className={styles.arrowHead} />
            </marker>
            <path d={this.props.edge.line} markerEnd="'url(#arrow-1)'" />
          </g>
        </g>
      </svg>
    );
  }
}

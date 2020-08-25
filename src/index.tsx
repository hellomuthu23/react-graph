import * as React from 'react';
import { Component } from 'react';

import styles from './styles.module.css';

interface Props {
  text: string;
  color: string;
}
export default class GraphComponent extends Component<Props> {
  render() {
    return (
      <div className={styles.test}>
        Graph Component: {this.props.text} , {this.props.color}{' '}
      </div>
    );
  }
}

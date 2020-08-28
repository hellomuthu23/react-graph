import 'react-graph/dist/index.css';

import React from 'react';
import GraphComponent from 'react-graph';

import { sampleData } from './sample-data';

const App = () => {
  return <GraphComponent graphInputData={sampleData} />;
};

export default App;

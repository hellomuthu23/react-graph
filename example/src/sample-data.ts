import { GraphInputData } from 'react-graph/src/graph.models';

export const sampleData: GraphInputData = {
  nodes: [
    { id: 'one', type: 'input' },
    { id: 'two', type: 'input' },
    { id: 'three', type: 'input' },
    { id: 'four', type: 'input' },
    { id: 'five', type: 'output' }
  ],
  edges: [
    { id: 'e1', source: 'one', target: 'two' },
    { id: 'e2', source: 'two', target: 'three' },
    { id: 'e3', source: 'two', target: 'four' }
  ]
};

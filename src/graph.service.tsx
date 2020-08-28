import * as shape from 'd3-shape';
import * as dagre from 'dagre';

import { Graph, GraphInputData, Node, NodeShape, NodeType, Position } from './graph.models';

enum Orientation {
  LEFT_TO_RIGHT = 'LR',
  RIGHT_TO_LEFT = 'RL',
  TOP_TO_BOTTOM = 'TB',
  BOTTOM_TO_TOP = 'BT'
}
enum Alignment {
  CENTER = 'C',
  UP_LEFT = 'UL',
  UP_RIGHT = 'UR',
  DOWN_LEFT = 'DL',
  DOWN_RIGHT = 'DR'
}

interface DagreSettings {
  orientation?: Orientation;
  marginX?: number;
  marginY?: number;
  edgePadding?: number;
  rankPadding?: number;
  nodePadding?: number;
  align?: Alignment;
  acyclicer?: 'greedy' | undefined;
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
  multigraph?: boolean;
  compound?: boolean;
}

export default class GraphService {
  private defaultSettings: DagreSettings = {
    orientation: Orientation.LEFT_TO_RIGHT,
    marginX: 0,
    marginY: 20,
    edgePadding: 20,
    rankPadding: 50,
    nodePadding: 10,
    multigraph: true,
    compound: true
  };

  public initializeGraph(graphInputData: GraphInputData): Graph {
    const graph: Graph = {
      nodes: [...graphInputData.nodes].map(this.initializeNode),
      edges: graphInputData.edges
    };

    // Use dagre graph to calculate the layout of the graph
    this.createDagreGraph(graph);
    return graph;
  }

  private initializeNode(node: Node): Node {
    // set default height and width for the nodes
    if (!node.dimension) {
      if (node.shape === 'circle') {
        node.dimension = {
          width: 100,
          height: 100,
          radius: 50
        };
      } else {
        // for rect
        node.dimension = {
          width: 200,
          height: 100,
          radius: 0
        };
      }
    }
    node.position = {
      x: 0,
      y: 0
    };
    return node;
  }

  private createDagreGraph(graph: Graph): dagre.graphlib.Graph {
    const settings = { ...this.defaultSettings };
    const dagreGraph = new dagre.graphlib.Graph({
      compound: settings.compound,
      multigraph: settings.multigraph
    }) as dagre.graphlib.Graph;
    dagreGraph.setGraph({
      rankdir: settings.orientation,
      marginx: settings.marginX,
      marginy: settings.marginY,
      edgesep: settings.edgePadding,
      ranksep: settings.rankPadding,
      nodesep: settings.nodePadding,
      align: settings.align,
      acyclicer: settings.acyclicer,
      ranker: settings.ranker,
      compound: settings.compound
    });

    // Default to assigning a new object as a label for each new edge.
    dagreGraph.setDefaultEdgeLabel(() => {
      return {
        /* empty */
      };
    });

    // Add nodes to dagre graph
    graph.nodes.forEach((n) => {
      dagreGraph.setNode(n.id, {
        height: n.dimension.height,
        width: n.dimension.width
      });
    });

    // Add edges (= node connectors) to dagre graph
    graph.edges.forEach((l) => {
      if (settings.multigraph) {
        dagreGraph.setEdge(l.source, l.target, l, l.id ? l.id : 'some-edge-id');
      } else {
        dagreGraph.setEdge(l.source, l.target);
      }
    });

    dagre.layout(dagreGraph);

    // Apply dagre-calculated layout to graph
    this.applyDagreLayout(dagreGraph, graph);
    return dagreGraph;
  }

  private applyDagreLayout(dagreGraph: dagre.graphlib.Graph, graph: Graph) {
    // Set position nodes in graph
    dagreGraph.nodes().forEach((dagreNodeLabel: string) => {
      const node = graph.nodes.find((n) => n.id === dagreNodeLabel);
      if (node) {
        const dagreNode = dagreGraph.node(dagreNodeLabel);
        node.position = {
          x: dagreNode.x,
          y: dagreNode.y
        };
      }
    });

    // Draw node connectors on graph
    dagreGraph.edges().forEach((dagreEdge: any) => {
      const edge = graph.edges.find((e) => e.id === dagreEdge.name);
      const nodes = graph.nodes.filter(
        (n) => n.type === NodeType.Input || n.type === NodeType.Output
      );
      const circleNodes = graph.nodes.filter(
        (n) => n.shape === NodeShape.Circle
      );
      let points = dagreGraph.edge(dagreEdge).points;

      if (edge) {
        nodes.forEach((node) => {
          if (edge.source === node.id) {
            let nodeLinks = graph.edges.filter((l) => l.source === node.id);
            nodeLinks = nodeLinks.sort(
              (a, b) => a.points[0].y - b.points[0].y - 1
            );
            const i = nodeLinks.findIndex((l) => l.id === edge.id);
            points = this.adjustInputLine(points, node, i, nodeLinks.length);
          }
        });

        circleNodes.forEach((node) => {
          if (edge.target === node.id) {
            points[points.length - 1] = this.circleIntersect(
              points[points.length - 2],
              node.position,
              node.dimension.radius
            );
          } else if (edge.source === node.id) {
            points[0] = this.circleIntersect(
              points[1],
              node.position,
              node.dimension.radius
            );
          }
        });

        edge.line = this.generateLine(points);
      } else {
        console.error('Link missing for ', dagreEdge);
      }
    });

    // set graph layout height and width
    graph.height = dagreGraph.graph().height;
    graph.width = dagreGraph.graph().width;
  }

  // Align end of arrow to be on the circle
  private circleIntersect(
    linePosition: Position,
    nodePosition: Position,
    r: number
  ): Position {
    const xl = linePosition.x - nodePosition.x;
    const yl = linePosition.y - nodePosition.y;

    if (xl === 0) {
      const yValueForSimpleCase =
        yl > 0 ? nodePosition.y + r : nodePosition.y - r;
      return { x: nodePosition.x, y: yValueForSimpleCase };
    }

    const xValue =
      ((r / Math.sqrt(1 + Math.pow(yl, 2) / Math.pow(xl, 2))) * xl) /
        Math.abs(xl) +
      nodePosition.x;
    const yValue = ((xValue - nodePosition.x) * yl) / xl + nodePosition.y;
    return { x: xValue, y: yValue };
  }

  private generateLine(points: any): any {
    const curveType = shape.curveBundle.beta(1);
    const lineFunction = shape
      .line<any>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(curveType);
    return lineFunction(points);
  }

  // Align the start of arrow line to the right of input nodes, and distribute evenly across the height
  // points[0] is the start of line, points[1] points to the tangent of first part of the curve
  // points[end] is the end of line, points[end-1] points to the tangent of last part of the curve
  // points[] has a usual/minimum length of 3 and no maximum, points[1] is usually the same point as points[end-1]
  private adjustInputLine(
    points: Position[],
    node: Node,
    lineIndex: number,
    numberOfLines: number
  ): Position[] {
    if (numberOfLines <= 1) {
      return points;
    }
    // Align x to the right of node card
    const x = node.position.x + node.dimension.width / 2;
    const dx = x - points[0].x;
    // Distribute y evenly across the height for parallel computations
    // For long links don't manipulate y to avoid overlapping with other nodes
    let y = points[0].y;
    let dy = 0;
    if (points.length < 4) {
      y =
        node.position.y +
        node.dimension.height * ((lineIndex + 1) / (numberOfLines + 1) - 1 / 2);
      dy = y - points[0].y;
    }

    points[0] = { x, y };
    points[1] = { x: points[1].x + dx, y: points[1].y + dy };

    return points;
  }
}

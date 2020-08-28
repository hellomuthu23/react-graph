export interface Node {
  id: string;
  title?: string;
  status?: Status;
  failureReason?: string;
  dimension?: Dimension;
  position?: Position;
  description?: string;
  type?: string;
  shape?: NodeShape;
}

export enum NodeType {
  Input = 'input',
  Process = 'process',
  Output = 'output',
  Decision = 'decision'
}

export enum NodeShape {
  Rect = 'rectangle',
  Circle = 'circle'
}

export interface Dimension {
  height: number;
  width: number;
  radius?: number;
}
export interface Position {
  x: number;
  y: number;
}

export enum Status {
  Initial = 'initial',
  Ready = 'ready',
  Success = 'success',
  Failure = 'failure',
  InProgress = 'in-progress',
  Warning = 'warning',
  Pending = 'pending'
}

export interface Edge {
  id: string;
  line?: string;
  points?: Position[];
  source: string;
  target: string;
}

export interface GraphInputData {
  nodes: Node[];
  edges: Edge[];
}

export interface Graph extends GraphInputData {
  height?: number;
  width?: number;
}

export interface Dimension {
  height: number;
  width: number;
  radius?: number;
}

export interface Position {
  x: number;
  y: number;
}

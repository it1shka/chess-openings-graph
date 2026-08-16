import { type Graph, GraphImpl } from './graph'
import { rawGraph } from './raw-graph.g'

export const graph: Graph = new GraphImpl(rawGraph)
export type { GraphNode } from './graph-node'
export type { Graph } from './graph'
export type { RawNode, RawGraph } from './raw-graph.g'

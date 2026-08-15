import { graph } from './graph.g'
import { OpeningsGraphExplorer } from './openings-graph-explorer'

function deepFreeze(obj: unknown) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }
  Object.freeze(obj)
  for (const prop of Object.values(obj)) {
    deepFreeze(prop)
  }
}

export const graphExplorer = (() => {
  deepFreeze(graph)
  return new OpeningsGraphExplorer(graph)
})()
export type {
  OpeningsGraphExplorerTreeNode,
  IOpeningsGraphExplorerNode,
} from './openings-graph-explorer'
export type { ChessOpeningNode, ChessOpeningGraph } from './graph.g'

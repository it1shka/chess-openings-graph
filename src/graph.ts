import { type GraphNode, GraphNodeImpl } from './graph-node'
import type { RawGraph, RawNode } from './raw-graph.g'

export interface Graph {
  rawGraph: DeepReadonly<RawGraph>
  openings: GraphNode[]
  rootOpenings: GraphNode[]
  terminalVariations: GraphNode[]
  getOpeningByPgn: (pgn: string) => GraphNode | undefined
  getOpeningByName: (name: string) => GraphNode | undefined
  getOpeningsByEco: (eco: string) => GraphNode[]
  getOpeningsByFen: (fen: string) => GraphNode[]
}

export class GraphImpl implements Graph {
  readonly #rawGraph: DeepReadonly<RawGraph>

  constructor(rawGraph: DeepReadonly<RawGraph>) {
    this.#rawGraph = rawGraph
  }

  get rawGraph(): DeepReadonly<RawGraph> {
    return this.#rawGraph
  }

  get openings(): GraphNode[] {
    return Object.values(this.#rawGraph).map(
      (node: DeepReadonly<RawNode>) => new GraphNodeImpl(node, this),
    )
  }

  get rootOpenings(): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.isRootOpening)
  }

  get terminalVariations(): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.isTerminalVariation)
  }

  getOpeningByPgn(pgn: string): GraphNode | undefined {
    const node = this.#rawGraph[pgn]
    if (node === undefined) {
      return undefined
    }
    return new GraphNodeImpl(node, this)
  }

  getOpeningByName(name: string): GraphNode | undefined {
    return this.openings.find((opening: DeepReadonly<GraphNode>) => opening.name === name)
  }

  getOpeningsByEco(eco: string): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.eco === eco)
  }

  getOpeningsByFen(fen: string): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.fen === fen)
  }
}

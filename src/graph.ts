import { type GraphNode, GraphNodeImpl } from './graph-node'
import type { RawGraph, RawNode } from './raw-graph.g'

export interface Graph {
  openings: readonly GraphNode[]
  rootOpenings: GraphNode[]
  terminalVariations: GraphNode[]
  getOpeningByPgn: (pgn: string) => GraphNode | undefined
  getOpeningsByName: (name: string) => GraphNode[]
  getOpeningsByEco: (eco: string) => GraphNode[]
  getOpeningsByFen: (fen: string) => GraphNode[]
  getOpeningsByEpd: (epd: string) => GraphNode[]
}

export class GraphImpl implements Graph {
  readonly #rawGraph: DeepReadonly<RawGraph>
  #openings: readonly GraphNode[] | undefined = undefined

  constructor(rawGraph: DeepReadonly<RawGraph>) {
    this.#rawGraph = rawGraph
  }

  get openings(): readonly GraphNode[] {
    this.#openings ??= Object.freeze(
      Object.values(this.#rawGraph).map(
        (node: DeepReadonly<RawNode>) => new GraphNodeImpl(node, this),
      ),
    )
    return this.#openings
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

  getOpeningsByName(name: string): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.name === name)
  }

  getOpeningsByEco(eco: string): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.eco === eco)
  }

  getOpeningsByFen(fen: string): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.fen === fen)
  }

  getOpeningsByEpd(epd: string): GraphNode[] {
    return this.openings.filter((opening: DeepReadonly<GraphNode>) => opening.epd === epd)
  }
}

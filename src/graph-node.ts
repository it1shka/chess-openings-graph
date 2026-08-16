import type { RawExtendedOpening, RawNode } from './raw-graph.g'
import { type Graph } from './graph'

const EMPTY_LENGTH = 0

export type GraphNode = RawExtendedOpening & {
  parent: GraphNode | undefined
  children: GraphNode[]
  isRootOpening: boolean
  isTerminalVariation: boolean
  predecessors: GraphNode[]
}

export class GraphNodeImpl implements GraphNode {
  readonly #rawNode: DeepReadonly<RawNode>
  readonly #graph: DeepReadonly<Graph>

  constructor(rawNode: DeepReadonly<RawNode>, graph: DeepReadonly<Graph>) {
    this.#rawNode = rawNode
    this.#graph = graph
  }

  get eco(): string {
    return this.#rawNode.eco
  }

  get name(): string {
    return this.#rawNode.name
  }

  get pgn(): string {
    return this.#rawNode.pgn
  }

  get fen(): string {
    return this.#rawNode.fen
  }

  get parent(): GraphNode | undefined {
    if (this.#rawNode.parent === undefined) {
      return undefined
    }
    return this.#graph.getOpeningByPgn(this.#rawNode.parent)!
  }

  get children(): GraphNode[] {
    return this.#rawNode.children.map((childPgn) => this.#graph.getOpeningByPgn(childPgn)!)
  }

  get isRootOpening(): boolean {
    return this.#rawNode.parent === undefined
  }

  get isTerminalVariation(): boolean {
    return this.#rawNode.children.length <= EMPTY_LENGTH
  }

  get predecessors(): GraphNode[] {
    const predecessors = []
    // eslint-disable-next-line no-this-assignment, no-this-alias
    let node: GraphNode | undefined = this
    while ((node = node.parent) !== undefined) {
      predecessors.push(node)
    }
    return predecessors.toReversed()
  }
}

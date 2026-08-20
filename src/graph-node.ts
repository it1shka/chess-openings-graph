import type { RawExtendedOpening, RawNode } from './raw-graph.g'
import { type Graph } from './graph'

const EMPTY_LENGTH = 0
const FEN_FIELDS_SEPARATOR = ' '
const START_EPD_FIELD = 0
const END_EPD_FIELD = 4

export type GraphNode = RawExtendedOpening & {
  /**
   * [EPD](https://en.wikipedia.org/wiki/Extended_Position_Description)
   * notation of the opening
   */
  epd: string
  /**
   * Parent opening: current opening is a variation of `parent`.
   * If `undefined` this means that this opening is a **root opening**.
   */
  parent: GraphNode | undefined
  /**
   * Children openings: variations of current opening.
   * If `children` is an empty list this means that this opening is a **terminal variation**
   */
  children: GraphNode[]
  /**
   * If `true`, then this opening has no `parent` (`parent === undefined`)
   */
  isRootOpening: boolean
  /**
   * If `true`, then this opening has no `children` (`children is an empty list []`)
   */
  isTerminalVariation: boolean
  /**
   * Returns the complete hierarchy of the opening's `parents`
   */
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

  get epd(): string {
    const fields = this.fen.split(FEN_FIELDS_SEPARATOR)
    return fields.slice(START_EPD_FIELD, END_EPD_FIELD).join(FEN_FIELDS_SEPARATOR)
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

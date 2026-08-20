import { type GraphNode, GraphNodeImpl } from './graph-node'
import type { RawGraph, RawNode } from './raw-graph.g'

export interface Graph {
  /**
   * List of all openings.
   */
  openings: readonly GraphNode[]
  /**
   * List of openings that don't have any `parent`, in other words that are not a variation of another opening.
   */
  rootOpenings: GraphNode[]
  /**
   * List of openings that don't have any `children`, in other words that do not have any variations.
   */
  terminalVariations: GraphNode[]
  /**
   * Returns an opening by its [PGN](https://en.wikipedia.org/wiki/Portable_Game_Notation).
   * PGN is guaranteed to be unique for each opening.
   */
  getOpeningByPgn: (pgn: string) => GraphNode | undefined
  /**
   * Returns a list of openings by the given name.
   * Name is not unique per opening: due to transpositions,
   * there are certain different PGNs that correspond to the same named opening.
   */
  getOpeningsByName: (name: string) => GraphNode[]
  /**
   * Returns a list of openings by the given [ECO code](https://en.wikipedia.org/wiki/List_of_ECO_codes).
   * ECO code is not unique per opening: certain ECO codes may belong to many openings.
   * E.g. look at the [list of A00 openings](https://chessopenings.com/eco/A00/).
   */
  getOpeningsByEco: (eco: string) => GraphNode[]
  /**
   * Returns a list of openings by the given [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation).
   * Be aware that FEN contains move counts as its 5th and 6th fields.
   * If you want to omit move counts, consider using [EPD](https://en.wikipedia.org/wiki/Extended_Position_Description)
   * and `getOpeningsByEpd(epd: string): GraphNode[]` method.
   * FEN is not unique per opening: single FEN can map to multiple PGNs, therefore
   * it can technically map to multiple openings. Although for the **current database**
   * most of the time (if not always) FEN maps to exactly one opening. So you may want
   * to consider using `getOpeningsByFen(yourFen)[0]`
   */
  getOpeningsByFen: (fen: string) => GraphNode[]
  /**
   * Returns a list of openings by the given [EPD](https://en.wikipedia.org/wiki/Extended_Position_Description).
   * Similar to `getOpeningsByFen(fen: string): GraphNode[]` but instead accepts EPD that omits 5th and 6th FEN fields.
   * EPD is not unique per opening: single EPD can map to multiple PGNs, therefore
   * it can technically map to multiple openings. Although for the **current database**
   * most of the time (if not always) EPD maps to exactly one opening. So you may want
   * to consider using `getOpeningsByEpd(yourEpd)[0]`
   */
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

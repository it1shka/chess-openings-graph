import { Chess } from 'chess.js'
import type { ChessOpening, ChessOpeningGraph } from './graph-types'

export const getChess = (() => {
  let instance: Chess | undefined
  return (pgn: string) => {
    if (instance === undefined) {
      instance = new Chess()
    }
    instance.loadPgn(pgn)
    return instance
  }
})()

export function isValidPgn(pgn: string) {
  try {
    getChess(pgn)
    return true
  } catch {
    return false
  }
}

export function isChessOpening(value: unknown): value is ChessOpening {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return ('eco' in value && typeof value.eco === 'string' && value.eco.length > 0)
    && ('name' in value && typeof value.name === 'string' && value.name.length > 0)
    && ('pgn' in value && typeof value.pgn === 'string' && isValidPgn(value.pgn))
}

export interface IGraphBuilder<G> {
  getGraph(): G
  addOpening(opening: ChessOpening): void
  buildGraph(): void
}

export class GraphBuilder implements IGraphBuilder<ChessOpeningGraph> {
  openings: ChessOpeningGraph = {}

  getGraph() {
    return this.openings
  }

  addOpening(opening: ChessOpening) {
    this.openings[opening.pgn] = {
      ...opening,
      fen: getChess(opening.pgn).fen(),
      children: [],
    }
  }

  buildGraph() {
    for (const opening of Object.values(this.openings)) {
      const parentPgn = this.findParent(opening.pgn)
      if (parentPgn === undefined) {
        continue
      }
      opening.parent = parentPgn
      this.openings[parentPgn].children.push(opening.pgn)
    }
  }

  private findParent(pgn: string) {
    const chess = getChess(pgn)
    while (chess.undo() !== null) {
      const parentPgn = chess.pgn().replace(/\[.*?\]\r?\n?/g, '').replace('*', '').trim()
      if (parentPgn in this.openings) {
        return parentPgn
      }
    }
    return undefined
  }
}

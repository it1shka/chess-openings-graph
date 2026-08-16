import type { RawGraph, RawOpening } from './graph-types'
import { Chess } from 'chess.js'

const EMPTY_LENGTH = 0

export const getChess = (() => {
  let instance: Chess | undefined = undefined
  return (pgn: string): Chess => {
    instance ??= new Chess()
    instance.loadPgn(pgn)
    return instance
  }
})()

export const isValidPgn = (pgn: string): boolean => {
  try {
    getChess(pgn)
    return true
  } catch {
    return false
  }
}

export const isRawOpening = (value: unknown): value is RawOpening => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return (
    'eco' in value &&
    typeof value.eco === 'string' &&
    value.eco.length > EMPTY_LENGTH &&
    'name' in value &&
    typeof value.name === 'string' &&
    value.name.length > EMPTY_LENGTH &&
    'pgn' in value &&
    typeof value.pgn === 'string' &&
    isValidPgn(value.pgn)
  )
}

export class GraphBuilder {
  #graph: RawGraph = {}

  get graph(): RawGraph {
    return this.#graph
  }

  addOpening(opening: DeepReadonly<RawOpening>): void {
    this.#graph[opening.pgn] = {
      ...opening,
      children: [],
      fen: getChess(opening.pgn).fen(),
    }
  }

  buildGraph(): void {
    for (const opening of Object.values(this.#graph)) {
      const parentPgn = this.findParent(opening.pgn)
      if (parentPgn !== undefined) {
        opening.parent = parentPgn
        this.#graph[parentPgn]!.children.push(opening.pgn)
      }
    }
  }

  private findParent(pgn: string): string | undefined {
    const chess = getChess(pgn)
    while (chess.undo() !== null) {
      const parentPgn = chess
        .pgn()
        .replaceAll(/\[.*?\]\r?\n?/gu, '')
        .replace('*', '')
        .trim()
      if (parentPgn in this.#graph) {
        return parentPgn
      }
    }
    return undefined
  }
}

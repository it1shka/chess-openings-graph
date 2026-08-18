import { describe, it as baseIt, expect } from 'vitest'
import { GraphImpl } from '../src/graph'
import { GraphNodeImpl } from '../src/graph-node'
import { type RawGraph } from '../src/raw-graph.g'

const it = baseIt
  .extend('exampleRawGraph', (): RawGraph => {
    return {
      '1. a3': {
        eco: 'X00',
        name: 'Opening 1',
        pgn: '1. a3',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        children: ['1. a3 b6', '1. a3 c6'],
      },
      '1. a3 b6': {
        eco: 'X00',
        name: 'Opening 1: Variation 1',
        pgn: '1. a3 b6',
        fen: 'rnbqkbnr/p1pppppp/1p6/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2',
        parent: '1. a3',
        children: [],
      },
      '1. a3 c6': {
        eco: 'X00',
        name: 'Opening 1: Variation 2',
        pgn: '1. a3 c6',
        fen: 'rnbqkbnr/pp1ppppp/2p5/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2',
        parent: '1. a3',
        children: [],
      },
    }
  })
  .extend('graph', ({ exampleRawGraph }) => new GraphImpl(exampleRawGraph))

describe('GraphImpl.openings', () => {
  it('returns instances of GraphNodeImpl', ({ graph }) => {
    const result = graph.openings
    expect(result.every((opening) => opening instanceof GraphNodeImpl)).toBe(true)
  })

  it('returns openings from the underlying raw graph', ({ exampleRawGraph, graph }) => {
    const openingPgns = graph.openings.map(({ pgn }) => pgn)
    expect(Object.keys(exampleRawGraph).every((pgn) => openingPgns.includes(pgn))).toBe(true)
  })
})

describe('GraphImpl.rootOpenings', () => {
  it('returns openings that do not have a parent', ({ graph }) => {
    const result = graph.rootOpenings
    expect(result).toHaveLength(1)
    expect(result[0].pgn).toBe('1. a3')
  })
})

describe('GraphImpl.terminalVariations', () => {
  it('returns openings that do not have any children', ({ graph }) => {
    const openingPgns = graph.terminalVariations.map(({ pgn }) => pgn)
    expect(openingPgns).toHaveLength(2)
    expect(openingPgns).toContain('1. a3 b6')
    expect(openingPgns).toContain('1. a3 c6')
  })
})

describe('GraphImpl.getOpeningByPgn', () => {
  it('returns undefined when unknown pgn is given', ({ graph }) => {
    const result = graph.getOpeningByPgn('1. e4 e5')
    expect(result).toBeUndefined()
  })

  it('returns proper opening when given known pgn', ({ graph }) => {
    const result = graph.getOpeningByPgn('1. a3')
    expect(result).not.toBeUndefined()
    expect(result!.name).toBe('Opening 1')
  })
})

describe('GraphImpl.getOpeningByName', () => {
  it('returns undefined when unknown name is given', ({ graph }) => {
    const result = graph.getOpeningByPgn("King's Pawn Opening")
    expect(result).toBeUndefined()
  })

  it('returns proper opening when given known name', ({ graph }) => {
    const result = graph.getOpeningByName('Opening 1')
    expect(result).not.toBeUndefined()
    expect(result!.pgn).toBe('1. a3')
  })
})

describe('GraphImpl.getOpeningsByEco', () => {
  it('returns empty list when given unknown eco code', ({ graph }) => {
    const result = graph.getOpeningsByEco('A00')
    expect(result).toHaveLength(0)
  })

  it('returns list of openings with given eco code', ({ graph }) => {
    const result = graph.getOpeningsByEco('X00')
    expect(result).toHaveLength(3)
  })
})

describe('GraphImpl.getOpeningsByFen', () => {
  it('returns empty list when given unknown fen', ({ graph }) => {
    const result = graph.getOpeningsByFen(
      'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    )
    expect(result).toHaveLength(0)
  })

  it('returns list of openings with given fen', ({ graph }) => {
    const result = graph.getOpeningsByFen(
      'rnbqkbnr/pp1ppppp/2p5/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2',
    )
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Opening 1: Variation 2')
  })
})

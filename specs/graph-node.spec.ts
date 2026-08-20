import { describe, it as baseIt, expect } from 'vitest'
import { GraphImpl } from '../src/graph'
import { GraphNodeImpl } from '../src/graph-node'

const it = baseIt
  .extend('rawNodeA', {
    eco: 'X00',
    name: 'Opening 1',
    pgn: '1. a3',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    children: ['1. a3 b6'],
  })
  .extend('rawNodeB', {
    eco: 'X00',
    name: 'Opening 1: Variation 1',
    pgn: '1. a3 b6',
    fen: 'rnbqkbnr/p1pppppp/1p6/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2',
    parent: '1. a3',
    children: [],
  })
  .extend('rawGraph', ({ rawNodeA, rawNodeB }) => ({
    '1. a3': rawNodeA,
    '1. a3 b6': rawNodeB,
  }))
  .extend('graph', ({ rawGraph }) => new GraphImpl(rawGraph))
  .extend('graphNodeA', ({ rawNodeA, graph }) => new GraphNodeImpl(rawNodeA, graph))
  .extend('graphNodeB', ({ rawNodeB, graph }) => new GraphNodeImpl(rawNodeB, graph))

describe('GraphNodeImpl.eco', () => {
  it('returns eco code of underlying raw node', ({ graphNodeA, rawNodeA }) => {
    const result = graphNodeA.eco
    expect(result).toBe(rawNodeA.eco)
  })
})

describe('GraphNodeImpl.name', () => {
  it('returns name of underlying raw node', ({ graphNodeA, rawNodeA }) => {
    const result = graphNodeA.name
    expect(result).toBe(rawNodeA.name)
  })
})

describe('GraphNodeImpl.pgn', () => {
  it('returns pgn of underlying raw node', ({ graphNodeA, rawNodeA }) => {
    const result = graphNodeA.pgn
    expect(result).toBe(rawNodeA.pgn)
  })
})

describe('GraphNodeImpl.fen', () => {
  it('returns fen of underlying raw node', ({ graphNodeA, rawNodeA }) => {
    const result = graphNodeA.fen
    expect(result).toBe(rawNodeA.fen)
  })
})

describe('GraphNodeImpl.epd', () => {
  it('returns epd properly derived from fen field', ({ graphNodeA, graphNodeB }) => {
    const resultA = graphNodeA.epd
    expect(resultA).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
    const resultB = graphNodeB.epd
    expect(resultB).toBe('rnbqkbnr/p1pppppp/1p6/8/8/P7/1PPPPPPP/RNBQKBNR w KQkq -')
  })
})

describe('GraphNodeImpl.parent', () => {
  it('returns undefined when node does not have a parent', ({ graphNodeA }) => {
    const result = graphNodeA.parent
    expect(result).toBeUndefined()
  })

  it('returns proper parent when it exists', ({ graphNodeA, graphNodeB }) => {
    const parent = graphNodeB.parent
    expect(parent).not.toBeUndefined()
    expect(parent!.pgn).toBe(graphNodeA.pgn)
  })
})

describe('GraphNodeImpl.children', () => {
  it('returns an empty list if opening is a terminal variation', ({ graphNodeB }) => {
    const result = graphNodeB.children
    expect(result).toHaveLength(0)
  })

  it('returns proper children if they are present', ({ graphNodeA, graphNodeB }) => {
    const result = graphNodeA.children
    expect(result).toHaveLength(1)
    expect(result[0].pgn).toBe(graphNodeB.pgn)
  })
})

describe('GraphNodeImpl.isRootOpening', () => {
  it('returns true if does not have a parent', ({ graphNodeA }) => {
    const result = graphNodeA.isRootOpening
    expect(result).toBe(true)
  })

  it('returns false if has a parent', ({ graphNodeB }) => {
    const result = graphNodeB.isRootOpening
    expect(result).toBe(false)
  })
})

describe('GraphNodeImpl.isTerminalVariation', () => {
  it('returns true if does not have children', ({ graphNodeB }) => {
    const result = graphNodeB.isTerminalVariation
    expect(result).toBe(true)
  })

  it('returns false if has children', ({ graphNodeA }) => {
    const result = graphNodeA.isTerminalVariation
    expect(result).toBe(false)
  })
})

describe('GraphNodeImpl.predecessors', () => {
  it('returns empty list if parent is not present', ({ graphNodeA }) => {
    const result = graphNodeA.predecessors
    expect(result).toHaveLength(0)
  })

  it('returns proper predecessors if present', ({ graphNodeB, graphNodeA }) => {
    const result = graphNodeB.predecessors
    expect(result).toHaveLength(1)
    expect(result[0].pgn).toBe(graphNodeA.pgn)
  })
})

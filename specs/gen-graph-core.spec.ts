import { describe, it as baseIt, expect } from 'vitest'
import { Chess } from 'chess.js'
import type { RawOpening } from '../scripts/graph-types'
import { getChess, GraphBuilder, isRawOpening, isValidPgn } from '../scripts/gen-graph-core'

const it = baseIt
  .extend('examplePgn', '1. g4')
  .extend('exampleRawOpening', (): RawOpening => ({
    eco: 'A00',
    name: 'Amar Opening',
    pgn: '1. Nh3',
  }))
  .extend('graphBuilder', () => new GraphBuilder())

describe('getChess', () => {
  it('returns Chess instance', ({ examplePgn }) => {
    const instance = getChess(examplePgn)
    expect(instance).toBeInstanceOf(Chess)
  })

  it('returns same Chess instance among multiple calls', ({ examplePgn }) => {
    const instanceA = getChess(examplePgn)
    const instanceB = getChess(examplePgn)
    expect(instanceA).toBe(instanceB)
  })
})

describe('isValidPgn', () => {
  it.for([
    { pgn: '1. e4 Nc6 2. Nc3 Nf6 3. d4 e5' },
    { pgn: '1. d4 d5 2. e4 dxe4 3. Be3' },
    { pgn: '1. d4 Nf6 2. Nf3 e6 3. e3 b6 4. Bd3 Bb7 5. O-O c5 6. b3 Be7 7. Bb2 O-O 8. Nbd2 d5' },
  ])('returns true for valid pgn "$pgn"', ({ pgn }) => {
    const result = isValidPgn(pgn)
    expect(result).toBe(true)
  })

  it.for([
    { pgn: '1. e4 Nc6 2. N3 Nf6 3. d4 e5' },
    { pgn: 'some invalid pgn' },
    { pgn: '1. d4 Nf6 2. Nf3 e6 3. e3 b6 4. Bd3 Bb7 5. OO c5 6. b3 Be7 7. Bb2 O-O 8. Nbd2 d5' },
  ])('returns false for invalid pgn "$pgn"', ({ pgn }) => {
    const result = isValidPgn(pgn)
    expect(result).toBe(false)
  })
})

describe('isRawOpening', () => {
  const rawOpeningFields: Array<{ field: keyof RawOpening }> = [
    { field: 'eco' },
    { field: 'name' },
    { field: 'pgn' },
  ]

  it.for(rawOpeningFields)(
    'returns false when field "$field" is missing',
    ({ field }, { exampleRawOpening }) => {
      delete exampleRawOpening[field]
      const result = isRawOpening(exampleRawOpening)
      expect(result).toBe(false)
    },
  )

  it.for(rawOpeningFields)(
    'returns false when field "$field" has incorrect type',
    ({ field }, { exampleRawOpening }) => {
      const alteredRawOpening: unknown = {
        ...exampleRawOpening,
        [field]: new Date(),
      }
      const result = isRawOpening(alteredRawOpening)
      expect(result).toBe(false)
    },
  )

  const nonEmptyFields: Array<{ field: keyof RawOpening }> = [{ field: 'eco' }, { field: 'name' }]

  it.for(nonEmptyFields)(
    'returns false when field "$field" is empty string',
    ({ field }, { exampleRawOpening }) => {
      const alteredRawOpening = {
        ...exampleRawOpening,
        [field]: '',
      }
      const result = isRawOpening(alteredRawOpening)
      expect(result).toBe(false)
    },
  )

  it.for([
    { value: NaN },
    { value: 'some string' },
    { value: null },
    { value: undefined },
    { value: new Date() },
    { value: () => {} },
  ])('returns false for non-object value "$value"', ({ value }) => {
    const result = isRawOpening(value)
    expect(result).toBe(false)
  })

  it('returns true for valid raw opening', ({ exampleRawOpening }) => {
    const result = isRawOpening(exampleRawOpening)
    expect(result).toBe(true)
  })
})

describe('GraphBuilder.graph', () => {
  it('returns an object', ({ graphBuilder }) => {
    const result = graphBuilder.graph
    expect(result).not.toBeNull()
    expect(result).toBeTypeOf('object')
  })
})

describe('GraphBuilder.addOpening', () => {
  it('must add opening to graph object', ({ graphBuilder, exampleRawOpening }) => {
    graphBuilder.addOpening(exampleRawOpening)
    expect(graphBuilder.graph).toHaveProperty(exampleRawOpening.pgn)
    expect(graphBuilder.graph[exampleRawOpening.pgn]).toBeTypeOf('object')
  })
})

describe('GraphBuilder.buildGraph', () => {
  it('must connect openings into a hierarchical structure', ({ graphBuilder }) => {
    graphBuilder.addOpening({
      eco: 'CUSTOM_1',
      name: 'Custom 1',
      pgn: '1. h4',
    })
    graphBuilder.addOpening({
      eco: 'CUSTOM_2',
      name: 'Custom 2',
      pgn: '1. h4 f5 2. f4',
    })
    graphBuilder.buildGraph()
    expect(graphBuilder.graph).toHaveProperty('1. h4')
    expect(graphBuilder.graph).toHaveProperty('1. h4 f5 2. f4')
    expect(graphBuilder.graph['1. h4'].children).toContain('1. h4 f5 2. f4')
    expect(graphBuilder.graph['1. h4 f5 2. f4'].parent).toBe('1. h4')
  })
})

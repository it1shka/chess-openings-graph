export interface RawOpening {
  eco: string
  name: string
  pgn: string
}

export type RawExtendedOpening = RawOpening & {
  fen: string
}

export type RawNode = RawExtendedOpening & {
  parent?: string
  children: string[]
}

export type RawGraph = Record<string, RawNode>

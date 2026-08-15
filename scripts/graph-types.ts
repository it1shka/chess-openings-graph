export type ChessOpening = {
  eco: string
  name: string
  pgn: string
}

export type ChessOpeningNode = ChessOpening & {
  fen: string
  parent?: string
  children: string[]
}

export type ChessOpeningGraph = Record<string, ChessOpeningNode>

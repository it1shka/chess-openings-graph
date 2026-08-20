export interface RawOpening {
  /**
   * [ECO code](https://en.wikipedia.org/wiki/List_of_ECO_codes)
   * of the current opening
   */
  eco: string
  /**
   * Name of the current opening
   */
  name: string
  /**
   * [PGN](https://en.wikipedia.org/wiki/Portable_Game_Notation) notation
   * of the current opening
   */
  pgn: string
}

export type RawExtendedOpening = RawOpening & {
  /**
   * [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) notation
   * of the current opening
   */
  fen: string
}

export type RawNode = RawExtendedOpening & {
  parent?: string
  children: string[]
}

export type RawGraph = Record<string, RawNode>

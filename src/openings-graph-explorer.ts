import { type ChessOpeningGraph, type ChessOpeningNode } from './graph.g'

export type OpeningsGraphExplorerTreeNode = {
  eco: string
  name: string
  pgn: string
  fen: string
  children: OpeningsGraphExplorerTreeNode[]
}

export interface IOpeningsGraphExplorerNode {
  eco: string
  name: string
  pgn: string
  fen: string
  getParent(): IOpeningsGraphExplorerNode | undefined
  getChildren(): IOpeningsGraphExplorerNode[]
  isRootOpening(): boolean
  isTerminalVariation(): boolean
  getPredecessors(): IOpeningsGraphExplorerNode[]
  asTree(): OpeningsGraphExplorerTreeNode
}

class OpeningsGraphExplorerNode implements IOpeningsGraphExplorerNode {
  constructor(
    readonly eco: string,
    readonly name: string,
    readonly pgn: string,
    readonly fen: string,
    private parent: string | undefined,
    private children: string[],
    private readonly explorer: OpeningsGraphExplorer,
  ) {}

  static fromGraphNode(
    node: ChessOpeningNode,
    explorer: OpeningsGraphExplorer,
  ): OpeningsGraphExplorerNode {
    return new OpeningsGraphExplorerNode(
      node.eco,
      node.name,
      node.pgn,
      node.fen,
      node.parent,
      node.children,
      explorer,
    )
  }

  getParent(): IOpeningsGraphExplorerNode | undefined {
    if (this.parent === undefined) {
      return undefined
    }
    return this.explorer.getOpeningByPgn(this.parent)!
  }

  getChildren(): IOpeningsGraphExplorerNode[] {
    return this.children.map((childPgn) => {
      return this.explorer.getOpeningByPgn(childPgn)!
    })
  }

  isRootOpening(): boolean {
    return this.parent === undefined
  }

  isTerminalVariation(): boolean {
    return this.children.length <= 0
  }

  getPredecessors(): IOpeningsGraphExplorerNode[] {
    const predecessors = []
    let node: IOpeningsGraphExplorerNode | undefined = this
    while ((node = node.getParent()) !== undefined) {
      predecessors.push(node)
    }
    return predecessors.toReversed()
  }

  asTree(): OpeningsGraphExplorerTreeNode {
    return {
      eco: this.eco,
      name: this.name,
      pgn: this.pgn,
      fen: this.fen,
      children: this.getChildren().map((child) => child.asTree()),
    }
  }
}

export class OpeningsGraphExplorer {
  constructor(private readonly graph: ChessOpeningGraph) {}

  getRawGraph(): ChessOpeningGraph {
    return this.graph
  }

  getOpenings(): IOpeningsGraphExplorerNode[] {
    return Object.values(this.graph).map((node) =>
      OpeningsGraphExplorerNode.fromGraphNode(node, this),
    )
  }

  getOpeningByPgn(pgn: string): IOpeningsGraphExplorerNode | undefined {
    const node = this.graph[pgn]
    if (node === undefined) {
      return undefined
    }
    return OpeningsGraphExplorerNode.fromGraphNode(node, this)
  }

  getOpeningByName(name: string): IOpeningsGraphExplorerNode | undefined {
    return this.getOpenings().find((opening) => opening.name === name)
  }

  getOpeningsByEco(eco: string): IOpeningsGraphExplorerNode[] {
    return this.getOpenings().filter((opening) => opening.eco === eco)
  }

  getOpeningsByFen(fen: string): IOpeningsGraphExplorerNode[] {
    return this.getOpenings().filter((opening) => opening.fen === fen)
  }

  getRootOpenings(): IOpeningsGraphExplorerNode[] {
    return this.getOpenings().filter((opening) => opening.isRootOpening())
  }

  getTerminalVariations(): IOpeningsGraphExplorerNode[] {
    return this.getOpenings().filter((opening) => opening.isTerminalVariation())
  }
}

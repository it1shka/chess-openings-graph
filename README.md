# chess-openings-graph: Library containing openings theory

The library fully embeds [Lichess opening tables](https://github.com/lichess-org/chess-openings) and allows users to fetch information about chess openings and their particular variations.

**Key features**:

- **_Basic openings data_**: you can get openings by ECO code, name, PGN, FEN, EPD, etc.
- **_Hierarchy_**: each opening has `parent` and `children` getters that allow you to move up and down in the opening hierarchy
- **_Simplicity_**: all the openings and relations between them are embedded directly into the library bundle, therefore the library does not have any dependencies and is synchronous and fast

**Important**:

- The library as of now contains only ~4k named openings. It does not contain all possible lines of those openings. It contains only named variations
- Since it embeds all the openings, the bundle size is rather large; if you're using it on the frontend, consider lazy import

## Quick start

1. Install the library using your preferred package manager:

```bash
npm install chess-openings-graph
```

2. Use it in your code:

```ts
import { graph } from 'chess-openings-graph'

const rootOpenings = graph.rootOpenings.map((opening) => opening.name)
console.log(rootOpenings)
```

## Documentation

A few words about terminology:

- **PGN**: [`Portable Game Notation`](https://en.wikipedia.org/wiki/Portable_Game_Notation). Each opening has a unique PGN, and fetching an opening by PGN is O(1). PGN contains the whole history of a chess game
- **ECO**: [`list of codes used to classify openings`](https://en.wikipedia.org/wiki/List_of_ECO_codes). Multiple openings can share the same ECO code (e.g. A00 is assigned to many rare and unusual openings)
- **FEN**: [`Forsyth–Edwards Notation`](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation). FEN contains only the state of the board but not the full game history; therefore, a single FEN can theoretically correspond to multiple PGNs
- **EPD**: [`Extended Position Description`](https://en.wikipedia.org/wiki/Extended_Position_Description). Based on FEN notation. In this library implementation, it just removes the last 2 FEN fields with move counts
- **Root opening**: opening that is not a variation of any other opening
- **Terminal variation**: opening that does not have any variations

The library was built with encapsulation and immutability in mind, so it relies heavily on _ECMAScript getters_.

The library exports two JS objects: `rawGraph` and `graph`:

- `rawGraph` is a plain JS object that contains the embedded openings data. It acts as a _"Database"_
- `graph` is an instance of a private class that defines useful getters and methods to fetch data from the `rawGraph`. It acts in a certain sense as a _"Data Access Object"_

You should mostly use `graph` for your own purposes.

`graph` satisfies the following interface:

```ts
export interface Graph {
  openings: readonly GraphNode[] // getter that returns all the openings
  rootOpenings: GraphNode[] // getter that returns openings that are not variations of another opening
  terminalVariations: GraphNode[] // getter that returns openings that don't have any further variations
  getOpeningByPgn: (pgn: string) => GraphNode | undefined
  getOpeningsByName: (name: string) => GraphNode[]
  getOpeningsByEco: (eco: string) => GraphNode[]
  getOpeningsByFen: (fen: string) => GraphNode[]
  getOpeningsByEpd: (epd: string) => GraphNode[]
}
```

As you may notice, those getters and methods return objects that satisfy the `GraphNode` interface (expanded for the convenience of readers):

```ts
export type GraphNode = {
  eco: string
  name: string
  pgn: string
  fen: string
  epd: string
  parent: GraphNode | undefined
  children: GraphNode[]
  isRootOpening: boolean
  isTerminalVariation: boolean
  predecessors: GraphNode[]
}
```

All of those properties are actually getters as well.

## For those who want to fork / contribute

The project uses the following development setup:

- **Node v22+** (although it's probably possible to use an older version)
- **npm** as package manager
- [**tsdown**](https://tsdown.dev/) as bundler
- [**Oxfmt**](https://oxc.rs/docs/guide/usage/formatter) for formatting
- [**Oxlint**](https://oxc.rs/docs/guide/usage/linter) for linting
- [**Vitest**](https://vitest.dev/) for writing specifications (tests)
- [**Husky**](https://github.com/typicode/husky) for pre-commit hooks
- ...and a bunch of other libraries needed for graph generation.

The [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) guideline should be followed, but it is currently checked neither by CI nor by pre-commit hooks.

**Important folders**:

- `openings/`: contains openings taken from [Lichess](https://github.com/lichess-org/chess-openings)
- `scripts/`: code related to graph generation
- `specs/`: contains specifications (unit tests)
- `src/`: code that later gets bundled into the library distribution

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Special thanks to [Lichess](https://github.com/lichess-org) for providing opening tables

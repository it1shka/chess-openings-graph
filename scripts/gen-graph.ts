import { createReadStream } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import csv from 'csv-parser'

import { isChessOpening, GraphBuilder } from './gen-graph-core'
import type { ChessOpeningGraph } from './graph-types'

const DEFAULT_OPENINGS_DIR = 'openings'
const DEFAULT_OUTPUT_DIR = 'src'
const DEFAULT_OUTPUT_FILENAME = 'graph.g.ts'

async function* readOpeningsFile(path: string) {
  const stream = createReadStream(path).pipe(csv({ separator: '\t' }))
  try {
    for await (const data of stream) {
      if (!isChessOpening(data)) {
        throw new Error(`Not a chess opening: ${JSON.stringify(data)}`)
      }
      yield data
    }
  } finally {
    stream.destroy()
  }
}

async function saveGraph(graph: ChessOpeningGraph, outputDir: string, outputFilename: string) {
  const typeDefinitions = await readFile(join(import.meta.dirname, 'graph-types.ts'), 'utf-8')
  const generatedFile = `${typeDefinitions}\nexport const graph: ChessOpeningGraph = ${JSON.stringify(graph, null, 2)}`
  await writeFile(join(outputDir, outputFilename), generatedFile)
}

async function main() {
  const openingsDir = process.env['OPENINGS_DIR'] ?? DEFAULT_OPENINGS_DIR
  const outputDir = process.env['OUTPUT_DIR'] ?? DEFAULT_OUTPUT_DIR
  const outputFilename = process.env['OUTPUT_FILENAME'] ?? DEFAULT_OUTPUT_FILENAME
  const files = await readdir(openingsDir)
  const graphBuilder = new GraphBuilder()
  await Promise.all(
    files.map(async (filename) => {
      const filepath = join(openingsDir, filename)
      for await (const opening of readOpeningsFile(filepath)) {
        graphBuilder.addOpening(opening)
      }
    }),
  )
  graphBuilder.buildGraph()
  const graph = graphBuilder.getGraph()
  await saveGraph(graph, outputDir, outputFilename)
}

await main()

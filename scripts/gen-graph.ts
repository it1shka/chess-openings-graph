import { GraphBuilder, isRawOpening } from './gen-graph-core'
import type { RawGraph, RawOpening } from './graph-types'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import csv from 'csv-parser'
import { join } from 'node:path'

const DEFAULT_OPENINGS_DIR = 'openings'
const DEFAULT_OUTPUT_DIR = 'src'
const DEFAULT_OUTPUT_FILENAME = 'raw-graph.g.ts'
const GRAPH_TAB_SIZE = 2

// eslint-disable-next-line func-style -- there's no syntax for generator lambdas yet
async function* readOpeningsFile(path: string): AsyncGenerator<RawOpening> {
  const stream = createReadStream(path).pipe(csv({ separator: '\t' }))
  try {
    for await (const data of stream) {
      if (!isRawOpening(data)) {
        throw new Error(`Not a chess opening: ${JSON.stringify(data)}`)
      }
      yield data
    }
  } finally {
    stream.destroy()
  }
}

const saveGraph = async (
  graph: DeepReadonly<RawGraph>,
  outputDir: string,
  outputFilename: string,
) => {
  const typeDefinitions = await readFile(join(import.meta.dirname, 'graph-types.ts'), 'utf8')
  const generatedFile = [
    '// WARNING: That file is auto-generated, DO NOT modify it by hand',
    '',
    typeDefinitions,
    '// eslint-disable sort-keys',
    '// eslint-disable max-lines',
    `export const rawGraph: RawGraph = ${JSON.stringify(graph, undefined, GRAPH_TAB_SIZE)}`,
  ].join('\n')
  await writeFile(join(outputDir, outputFilename), generatedFile)
}

const main = async () => {
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
  await saveGraph(graphBuilder.graph, outputDir, outputFilename)
}

await main()

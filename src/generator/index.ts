import { error, log } from 'fp-ts/Console'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { codegen } from './codegen'
import type { Environment } from './environment'
import { parse } from './parser'

export function main(inputFile: string, outputDir: string): void {
    const env: Environment = {
        inputFile,
        outputDir,
    }

    const program = pipe(parse(), RTE.chain(codegen))

    pipe(program(env), TE.fold(onLeft, onRight))()
}

function onLeft(e: Error): T.Task<void> {
    return T.fromIO(error(e))
}

function onRight(): T.Task<void> {
    return T.fromIO(log('Files generated successfully!'))
}

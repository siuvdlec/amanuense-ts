import * as R from 'fp-ts/Reader'
import { pipe } from 'fp-ts/function'
import type { Environment, ProgramRTE } from '../environment'
import type { ParserOutput } from '../parser/parserOutput'
import type { CodegenContext } from './context'
import { createDir, writeFile } from './fs'
import { main } from './main'

export function codegen(parserOutput: ParserOutput): ProgramRTE<void> {
    return pipe(
        main(),
        R.local(
            (env: Environment): CodegenContext => ({
                ...env,
                writeFile,
                createDir,
                parserOutput,
            })
        )
    )
}

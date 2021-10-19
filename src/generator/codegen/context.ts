import type * as RTE from 'fp-ts/ReaderTaskEither'
import type * as TE from 'fp-ts/TaskEither'
import type { Environment } from '../environment'
import type { ParserOutput } from '../parser/parserOutput'

export interface CodegenContext extends Environment {
    writeFile: (path: string, fileName: string, content: string) => TE.TaskEither<Error, void>
    createDir: (dirName: string) => TE.TaskEither<Error, void>
    parserOutput: ParserOutput
}

export type CodegenRTE<A> = RTE.ReaderTaskEither<CodegenContext, Error, A>

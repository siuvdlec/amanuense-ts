import { newIORef } from 'fp-ts/IORef'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import type { Environment, ProgramRTE } from '../environment'
import type { ParserContext } from './context'
import { main } from './main'
import { parseDocument } from './parseDocument'
import { ParserOutput, parserOutput } from './parserOutput'

export function parse(): ProgramRTE<ParserOutput> {
    return pipe(
        createParserContext(),
        RTE.chain(context => RTE.fromTaskEither(main()(context)))
    )
}

function createParserContext(): ProgramRTE<ParserContext> {
    return pipe(
        RTE.ask<Environment>(),
        RTE.bindTo('env'),
        RTE.bind('document', ({ env }) => RTE.fromTaskEither(parseDocument(env.inputFile))),
        RTE.bind('outputRef', () => RTE.rightIO(newIORef(parserOutput()))),
        RTE.map(({ document, outputRef }) => ({ document, outputRef }))
    )
}

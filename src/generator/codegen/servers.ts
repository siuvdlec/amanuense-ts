import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import type { ParsedServer } from '../parser/server'
import { writeGeneratedFile } from './common'
import type { CodegenContext, CodegenRTE } from './context'

export function generateServers(): CodegenRTE<void> {
    return pipe(
        RTE.asks((context: CodegenContext) => context.parserOutput.servers),
        RTE.chain(generateServerFile)
    )
}

function generateServerFile(servers: ParsedServer[]): CodegenRTE<void> {
    const content = `export const servers = [ ${servers.map(s => `"${s.url}"`).join(', ')} ]`

    return writeGeneratedFile('', 'servers.ts', content)
}

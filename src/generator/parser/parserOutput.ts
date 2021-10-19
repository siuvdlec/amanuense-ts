import type { ParsedComponents } from './common'
import type { ParsedOperation } from './operation'
import type { ParsedServer } from './server'

export interface ParserOutput {
    components: ParsedComponents
    operations: Record<string, ParsedOperation>
    tags: Record<string, string[]>
    servers: ParsedServer[]
}

export function parserOutput(): ParserOutput {
    return {
        components: {
            schemas: {},
            parameters: {},
            responses: {},
            requestBodies: {},
        },
        operations: {},
        tags: {},
        servers: [],
    }
}

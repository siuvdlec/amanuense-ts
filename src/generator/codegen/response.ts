import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'
import * as gen from 'io-ts-codegen'
import type { ResponseItemOrRef } from '../parser/response'
import { getItemOrRefPrefix, getParsedItem } from './common'
import type { CodegenRTE } from './context'

export function generateOperationResponses(responses: Record<string, ResponseItemOrRef>): CodegenRTE<string> {
    return pipe(
        responses,
        R.traverseWithIndex(RTE.ApplicativeSeq)((_, itemOrRef) => generateOperationResponse(itemOrRef)),
        RTE.map(rs => {
            const items = Object.entries(rs)
                .map(([code, response]) => `"${code}": ${response}`)
                .join(',\n')
            return `{ ${items} }`
        })
    )
}

export function generateOperationResponse(itemOrRef: ResponseItemOrRef): CodegenRTE<string> {
    return pipe(
        getParsedItem(itemOrRef),
        RTE.map(response => {
            if (response.item._tag === 'ParsedEmptyResponse') {
                return `{ _tag: "EmptyResponse" }`
            }

            if (response.item._tag === 'ParsedFileResponse') {
                return `{ _tag: "FileResponse" }`
            }

            const { type } = response.item

            const runtimeType =
                type.kind === 'TypeDeclaration' ? `${getItemOrRefPrefix(response)}${type.name}` : gen.printRuntime(type)

            return `{ _tag: "JsonResponse", decoder: ${runtimeType}}`
        })
    )
}

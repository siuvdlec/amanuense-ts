import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import type * as gen from 'io-ts-codegen'
import type { OpenAPIV3 } from 'openapi-types'
import { JSON_MEDIA_TYPE } from '../../definition'
import { JsonReference } from './JSONReference'
import { createComponentRef, getOrCreateType, parsedItem, ParsedItem, ComponentRef } from './common'
import type * as context from './context'

export interface ParsedEmptyResponse {
    _tag: 'ParsedEmptyResponse'
}

export interface ParsedFileResponse {
    _tag: 'ParsedFileResponse'
}

export interface ParsedJsonResponse {
    _tag: 'ParsedJsonResponse'
    type: gen.TypeDeclaration | gen.TypeReference
}

export type ParsedResponse = ParsedEmptyResponse | ParsedFileResponse | ParsedJsonResponse

export type ResponseItemOrRef = ParsedItem<ParsedResponse> | ComponentRef<'responses'>

export function parseResponse(
    name: string,
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject
): context.ParserRTE<ResponseItemOrRef> {
    if (JsonReference.is(response)) {
        return RTE.fromEither(createComponentRef('responses', response.$ref))
    }

    return parseResponseObject(name, response)
}

export function parseResponseObject(
    name: string,
    response: OpenAPIV3.ResponseObject
): context.ParserRTE<ParsedItem<ParsedResponse>> {
    const { content } = response

    const jsonSchema = content?.[JSON_MEDIA_TYPE]?.schema

    if (jsonSchema !== undefined) {
        return pipe(
            getOrCreateType(name, jsonSchema),
            RTE.map(type => parsedItem({ _tag: 'ParsedJsonResponse', type }, name))
        )
    }

    const contents = content && Object.values(content)

    if (contents === undefined || contents.length === 0 || contents[0].schema === undefined) {
        return RTE.right(parsedItem({ _tag: 'ParsedEmptyResponse' }, name))
    }

    const firstContentSchema = contents[0].schema

    if (
        !JsonReference.is(firstContentSchema) &&
        firstContentSchema.type === 'string' &&
        firstContentSchema.format === 'binary'
    ) {
        return RTE.right(parsedItem({ _tag: 'ParsedFileResponse' }, name))
    }

    return pipe(
        getOrCreateType(name, firstContentSchema),
        RTE.map(type => parsedItem({ _tag: 'ParsedJsonResponse', type }, name))
    )
}

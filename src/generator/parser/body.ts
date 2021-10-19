import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import * as gen from 'io-ts-codegen'
import type { OpenAPIV3 } from 'openapi-types'
import {
    JSON_MEDIA_TYPE,
    TEXT_PLAIN_MEDIA_TYPE,
    FORM_ENCODED_MEDIA_TYPE,
    MULTIPART_FORM_MEDIA_TYPE,
} from '../../definition'
import { JsonReference } from './JSONReference'
import { createComponentRef, getOrCreateType, parsedItem, ParsedItem, ComponentRef } from './common'
import type { ParserRTE } from './context'

interface BaseParsedBody {
    required: boolean
}

export interface ParsedBinaryBody extends BaseParsedBody {
    _tag: 'ParsedBinaryBody'
    mediaType: string
}

export interface ParsedFormBody extends BaseParsedBody {
    _tag: 'ParsedFormBody'
    type: gen.TypeDeclaration | gen.TypeReference
}

export interface ParsedMultipartBody extends BaseParsedBody {
    _tag: 'ParsedMultipartBody'
    type: gen.TypeDeclaration | gen.TypeReference
}

export interface ParsedJsonBody extends BaseParsedBody {
    _tag: 'ParsedJsonBody'
    type: gen.TypeDeclaration | gen.TypeReference
}

export interface ParsedTextBody extends BaseParsedBody {
    _tag: 'ParsedTextBody'
}

export type ParsedBody = ParsedBinaryBody | ParsedFormBody | ParsedMultipartBody | ParsedJsonBody | ParsedTextBody

export type BodyItemOrRef = ParsedItem<ParsedBody> | ComponentRef<'requestBodies'>

export function parseBody(
    name: string,
    body: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
): ParserRTE<BodyItemOrRef> {
    if (JsonReference.is(body)) {
        return RTE.fromEither(createComponentRef('requestBodies', body.$ref))
    }

    return parseBodyObject(name, body)
}

export function parseBodyObject(name: string, body: OpenAPIV3.RequestBodyObject): ParserRTE<ParsedItem<ParsedBody>> {
    const { content } = body
    const required = body.required ?? false

    const jsonContent = content?.[JSON_MEDIA_TYPE]

    if (jsonContent) {
        return pipe(
            getOrCreateTypeFromOptional(name, jsonContent.schema),
            RTE.map(type => {
                const parsedBodyL: ParsedJsonBody = {
                    _tag: 'ParsedJsonBody',
                    type,
                    required,
                }
                return parsedItem(parsedBodyL, name)
            })
        )
    }

    const textPlainContent = content?.[TEXT_PLAIN_MEDIA_TYPE]

    if (textPlainContent) {
        const parsedBodyL: ParsedTextBody = {
            _tag: 'ParsedTextBody',
            required,
        }
        return RTE.right(parsedItem(parsedBodyL, name))
    }

    const formEncodedContent = content?.[FORM_ENCODED_MEDIA_TYPE]

    if (formEncodedContent) {
        return pipe(
            getOrCreateTypeFromOptional(name, formEncodedContent.schema),
            RTE.map(type => {
                const parsedBodyL: ParsedFormBody = {
                    _tag: 'ParsedFormBody',
                    type,
                    required,
                }
                return parsedItem(parsedBodyL, name)
            })
        )
    }

    const multipartFormContent = content?.[MULTIPART_FORM_MEDIA_TYPE]

    if (multipartFormContent) {
        return pipe(
            getOrCreateTypeFromOptional(name, multipartFormContent.schema),
            RTE.map(type => {
                const parsedBodyL: ParsedMultipartBody = {
                    _tag: 'ParsedMultipartBody',
                    type,
                    required,
                }
                return parsedItem(parsedBodyL, name)
            })
        )
    }

    const mediaTypes = Object.keys(content)
    const mediaType = mediaTypes.length > 0 ? (mediaTypes[0] as string) : '*/*'

    const parsedBody: ParsedBinaryBody = {
        _tag: 'ParsedBinaryBody',
        mediaType,
        required,
    }

    return RTE.right(parsedItem(parsedBody, name))
}

function getOrCreateTypeFromOptional(
    name: string,
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): ParserRTE<gen.TypeDeclaration | gen.TypeReference> {
    if (schema === undefined) {
        return RTE.right(gen.unknownType)
    }
    return getOrCreateType(name, schema)
}

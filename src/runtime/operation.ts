import type { OperationMethod } from '../definition'
import type { OperationBody } from './body'
import type { OperationParameter } from './parameters'
import type { OperationResponses } from './responses'

export type OperationResponseType = 'empty' | 'string' | 'blob'

export interface Operation {
    path: string
    method: OperationMethod
    requestDefaultHeaders: Record<string, string>
    parameters: OperationParameter[]
    responses: OperationResponses
    body?: OperationBody
}

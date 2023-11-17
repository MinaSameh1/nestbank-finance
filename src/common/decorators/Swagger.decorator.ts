import { HttpStatus, Type, applyDecorators } from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiMethodNotAllowedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { PaginatedDto } from '../types'

const defaultDecorators = [
  ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error, something wrong happened',
  }),
  ApiUnauthorizedResponse({
    description: 'Unauthorized, Missing or expired Token',
  }),
  ApiForbiddenResponse({ description: 'Forbidden. Missing Permission' }),
  ApiMethodNotAllowedResponse({
    description: 'Cannot Do this action on this resource.',
  }),
]

/**
 * @description Decorator to document the endpoint with Swagger
 * Takes an object with the following properties:
 * @param {string} options.summary - The summary of the endpoint
 * @param {string} options.okDescription - The description of the 200 response
 * @param {string} options.badRequestDescription - The description of the 400 response
 * @param {number} options.badStatus - The status code of a bad request, defaults to 400 response
 * @param {number} options.status - The status code of the success response
 * @param {boolean} options.deprecated - Whether the endpoint is deprecated or not
 * @param {boolean} options.paginated - Whether the endpoint is paginated or not (Uses {@link PaginatedDto})
 * @param {Type | [Type] | string | Function | [Function]} options.type - The type of the response
 *
 * @returns {MethodDecorator} MethodDecorator - The decorators applied to the method
 *
 * @example
 * @SwaggerDocumentation({
 *  summary: 'Get all items',
 *  okDescription: 'Items found',
 *  badRequestDescription: 'Bad Request Example',
 *  type: [Item],
 *  })
 *  findAllController() { ... }
 */
export function SwaggerDocumentation(
  {
    summary,
    description,
    okDescription,
    badRequestDescription,
    badStatus = HttpStatus.BAD_REQUEST,
    status = HttpStatus.OK,
    deprecated = false,
    paginated = false,
    okType,
    okSchema = null,
    okProperties = {},
  }:
    | {
        summary: string
        description?: string
        okDescription: string
        badRequestDescription?: string
        badStatus?: number
        status?: number
        deprecated?: boolean
        paginated?: false
        // eslint-disable-next-line @typescript-eslint/ban-types
        okType?: Type | [Type] | string | Function | [Function]
        okSchema?: SchemaObject
        okProperties?: any
      }
    | {
        summary: string
        description?: string
        okDescription: string
        badStatus?: number
        badRequestDescription?: string
        deprecated?: boolean
        status?: number
        paginated: true
        // eslint-disable-next-line @typescript-eslint/ban-types
        okType: Type | Function | string
        okSchema?: null
        okProperties?: any
      },
): MethodDecorator {
  if (status === HttpStatus.CREATED)
    return applyDecorators(
      ApiOperation({ summary, description, deprecated }),
      ApiCreatedResponse({
        status,
        description: okDescription,
        ...okProperties,
        schema: okSchema,
        type: okType,
      }),
      ApiResponse({
        status: badStatus,
        description: badRequestDescription,
      }),
      ...defaultDecorators,
    )
  if (paginated)
    return applyDecorators(
      ApiOperation({ summary, description, deprecated }),
      ApiExtraModels(PaginatedDto),
      ApiOkResponse({
        status,
        description: okDescription,
        ...okProperties,
        schema: {
          title: `PaginatedResponseOf${okType}`,
          allOf: [
            { $ref: getSchemaPath(PaginatedDto) },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: getSchemaPath(okType as string) },
                },
              },
            },
          ],
        },
      }),
      ApiResponse({
        status: badStatus,
        description: badRequestDescription,
      }),
      ...defaultDecorators,
    )
  return applyDecorators(
    ApiOperation({ summary, description, deprecated }),
    ApiOkResponse({
      status,
      description: okDescription,
      ...okProperties,
      schema: okSchema,
      type: okType,
    }),
    ApiResponse({
      status: badStatus,
      description: badRequestDescription,
    }),
    ...defaultDecorators,
  )
}

/**
 * @description Decorator to document the pagination query params with Swagger
 * @returns {MethodDecorator} MethodDecorator - The decorators applied to the method
 * @example
 * @SwaggerDocumentationPaginationQuery()
 * findAll(@Paginate() paginate: Pagination) { ... }
 */
export function SwaggerDocumentationPaginationQuery(): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
      description: 'How many items to recieve',
    }),
  )
}

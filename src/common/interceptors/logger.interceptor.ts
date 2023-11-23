import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { tap } from 'rxjs'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name)

  // Interceptor
  intercept(context: ExecutionContext, next: CallHandler) {
    const start = Date.now()

    // check if request is from websocket

    return next.handle().pipe(
      tap(() => {
        return this.logNextRest(context, start)
      }),
    )
  }

  // Restful Api
  logNextRest(context: ExecutionContext, start: number) {
    if (context.getType() !== 'http') return
    const ctx = context.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const delta = Date.now() - start

    const ip =
      request.headers['fastly-client-ip'] || // Firebase functions
      request.headers['x-forwarded-for'] || // Any proxy
      request.ip // Default

    const log = `${new Date().toISOString()} ${request.method} ${request.url} ${
      response.statusCode
    } responseTime: ${delta}ms ip:${ip} using ${request.get('User-Agent')}`

    // Different log level for different status code range
    return response.statusCode >= 400
      ? response.statusCode > 499
        ? this.logger.error(log)
        : this.logger.warn(log)
      : this.logger.log(log)
  }
}

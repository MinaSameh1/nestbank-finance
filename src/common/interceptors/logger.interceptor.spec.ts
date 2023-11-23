import { LoggerInterceptor } from './logger.interceptor'

describe('LoggerInterceptor', () => {
  it('should be defined', () => {
    expect(new LoggerInterceptor()).toBeDefined()
  })

  it('should log different level for different status code', () => {
    const loggerInterceptor = new LoggerInterceptor()
    const logger = loggerInterceptor['logger']
    const logSpy = jest.spyOn(logger, 'log')
    const warnSpy = jest.spyOn(logger, 'warn')
    const errorSpy = jest.spyOn(logger, 'error')

    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getResponse: () => ({
          statusCode: 200,
          get: () => 'string',
        }),
        getRequest: () => ({
          method: 'GET',
          url: '/',
          get: () => 'User-Agent',
          headers: {
            'fastly-client-ip': 'fake-ip',
            'x-forwarded-for': 'fake-ip',
            'User-Agent': 'fake-user-agent',
            'Content-Type': 'application/json',
          },
        }),
      }),
    }

    loggerInterceptor.logNextRest(context as any, Date.now())
    expect(logSpy).toHaveBeenCalled()

    loggerInterceptor.logNextRest(
      {
        ...context,
        switchToHttp: () => ({
          ...context.switchToHttp(),
          getResponse: () => ({
            statusCode: 400,
          }),
        }),
      } as any,
      Date.now(),
    )
    expect(warnSpy).toHaveBeenCalled()

    loggerInterceptor.logNextRest(
      {
        ...context,
        switchToHttp: () => ({
          ...context.switchToHttp(),
          getResponse: () => ({
            statusCode: 500,
          }),
        }),
      } as any,
      Date.now(),
    )
    expect(errorSpy).toHaveBeenCalled()
  })
})

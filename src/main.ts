import { Logger, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { CustomConfigService } from './common/configuration'
import { setUpHelmet, setUpSwagger } from './common/helpers'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  const configService = app.get<CustomConfigService>(CustomConfigService)
  const port = configService.getPort()

  // Logging level
  app.useLogger(
    configService.isDev()
      ? ['log', 'debug', 'error', 'warn', 'verbose']
      : ['log', 'warn', 'error'],
  )

  // Setup versioning before any other middleware (So swagger can generate the correct docs)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  logger.log('Setting up Middlewares...')
  setUpHelmet(app)
  setUpSwagger(app, +port)

  await app.listen(port, () => {
    logger.debug(`Environment: ${configService.getAppEnv()}`)
    logger.log(`Application is running on: ${port}`)
    logger.log(`Swagger is running on: ${port}/docs`)
  })
}
bootstrap()

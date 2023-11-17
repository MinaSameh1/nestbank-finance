import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { swaggerCustomCss, swaggerCustomJs } from './swagger'

export const setUpHelmet = (app: INestApplication) => {
  app.use(helmet())
}

export const setUpSwagger = (app: INestApplication, port = 3000) => {
  const baseUrl = ''
  const logoUrl = ''

  const config = new DocumentBuilder()
    .setTitle('NestJs Bank Finance API')
    .setDescription(
      'This is the API documentation for the NestJs Bank Finance API',
    )
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`, 'Local Env') // append at the end
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs-json',
    yamlDocumentUrl: '/docs-yaml',
    customJsStr: swaggerCustomJs(baseUrl, logoUrl),
    customCss: swaggerCustomCss,
    customSiteTitle: 'NestJs Bank Backend',
    swaggerOptions: {
      displayOperationId: true,
    },
  })
}

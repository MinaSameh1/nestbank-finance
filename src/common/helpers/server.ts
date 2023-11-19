import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { swaggerCustomCss, swaggerCustomJs } from './swagger'

export const setUpHelmet = (app: INestApplication) => {
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  )
  return app
}

export const setUpSwagger = (app: INestApplication, port = 3000) => {
  const baseUrl = 'https://www.linkedin.com/company/owais-capital'
  const logoUrl = 'https://imgur.com/a/kP3OPMG'

  const config = new DocumentBuilder()
    .setTitle('NestJs Bank Finance API')
    .setDescription(
      'This is the API documentation for the NestJs Bank Finance API',
    )
    .setVersion('1.0')
    .addServer('https://nestbank-finance.onrender.com', 'Render Hosted')
    .addServer(`http://localhost:${port}`, 'Local Env') // append at the end
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs-json',
    yamlDocumentUrl: '/docs-yaml',
    customCss: swaggerCustomCss,
    customJsStr: swaggerCustomJs(baseUrl, logoUrl),
    customfavIcon: logoUrl,
    customSiteTitle: 'NestJs Bank Backend',
    swaggerOptions: {
      displayOperationId: true,
    },
  })
}

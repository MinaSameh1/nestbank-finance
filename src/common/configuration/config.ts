import { ConfigModule as NestConfigModule } from '@nestjs/config'
import { validate } from './config.env'

export default NestConfigModule.forRoot({
  validate,
  validationOptions: {
    allowUnknown: false,
    abortEarly: true,
  },
  isGlobal: false,
  envFilePath: '.env',
})

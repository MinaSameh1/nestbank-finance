import { ConfigModule } from '@nestjs/config';
import { validate } from './config.env';

export default ConfigModule.forRoot({
  validate,
  validationOptions: {
    allowUnknown: false,
    abortEarly: true,
  },
  isGlobal: true,
  envFilePath: '.env',
});

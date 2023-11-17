import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, CustomConfigService } from '../configuration'

export default TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [CustomConfigService],
  useFactory: (configService: CustomConfigService) => ({
    entities: [__dirname + '/../../**/*.entity.{js,ts}'],
    type: 'postgres',
    host: configService.getDbHost(),
    port: Number(configService.getDbPort()),
    username: configService.getDbUsername(),
    password: configService.getDbPassword(),
    database: configService.getDbDatabase(),
    synchronize: configService.isDev(),
  }),
})

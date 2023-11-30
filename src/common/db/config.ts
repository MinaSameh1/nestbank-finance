import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, CustomConfigService } from '../configuration'

const entitiesPath = __dirname + '/../../**/*.entity.{js,ts}'

export const getTestDbModule = (
  overrides?: Parameters<typeof TypeOrmModule.forRoot>[0],
) =>
  TypeOrmModule.forRoot({
    // connect to local test database
    entities: [entitiesPath],
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    synchronize: true,
    ...overrides,
  } as any)

export default TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [CustomConfigService],
  useFactory: (configService: CustomConfigService) => ({
    entities: [entitiesPath],
    type: 'postgres',
    host: configService.getDbHost(),
    port: Number(configService.getDbPort()),
    username: configService.getDbUsername(),
    password: configService.getDbPassword(),
    database: configService.getDbDatabase(),
    synchronize: configService.isDev(),
  }),
})

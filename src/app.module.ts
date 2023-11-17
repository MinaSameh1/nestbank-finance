import { Module } from '@nestjs/common'
import { ServerController } from './api/server.controller'
import { UsersModule } from './api/users/users.module'
import { ConfigModule } from './common/configuration'
import { DatabaseModule } from './common/db/db.module'

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule.forRoot({ controller: true }),
  ],
  controllers: [ServerController],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { ServerController } from './api/server.controller'
import { ConfigModule } from './common/configuration'
import { DatabaseModule } from './common/db/db.module'

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [ServerController],
})
export class AppModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '../configuration'
import BaseDbModule from './config'
import { DatabaseService } from './db.service'

@Module({
  imports: [BaseDbModule, ConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

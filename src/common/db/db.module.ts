import { Module } from '@nestjs/common'
import { ConfigModule } from '../configuration'
import BaseDbModule, { getTestDbModule } from './config'
import { DatabaseService } from './db.service'

@Module({
  imports: [BaseDbModule, ConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

@Module({
  providers: [DatabaseService],
})
export class TestDatabaseModule {
  static forRoot(dbOptions?: Parameters<typeof getTestDbModule>[0]) {
    return {
      module: TestDatabaseModule,
      imports: [getTestDbModule(dbOptions)],
      providers: [DatabaseService],
      exports: [DatabaseService],
    }
  }
}

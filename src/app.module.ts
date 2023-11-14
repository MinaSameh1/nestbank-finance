import { Module } from '@nestjs/common';
import { ConfigModule } from './common/configuration';
import DatabaseModule from './common/db/config';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

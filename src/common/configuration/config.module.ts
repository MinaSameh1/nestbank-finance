import { Module } from '@nestjs/common';
import { CustomConfigService } from '.';
import InitConfigModule from './config';

@Module({
  imports: [InitConfigModule],
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class ConfigModule {}

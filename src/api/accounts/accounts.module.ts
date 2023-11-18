import { DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseModule } from 'src/common/db'
import { Account } from 'src/entities'
import { UsersModule } from '../users/users.module'
import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    DatabaseModule,
    UsersModule.forRoot({ repoOnly: true }),
  ],
  providers: [AccountsService],
})
export class AccountsModule {
  static forRoot(options?: {
    controller?: boolean
    repoOnly?: boolean
  }): DynamicModule {
    // get controller and everything
    if (options?.controller) {
      return {
        module: AccountsModule,
        controllers: [AccountsController],
        providers: [AccountsService],
      }
    }
    // Get Repository only
    if (options?.repoOnly) {
      return {
        module: AccountsModule,
        providers: [],
        exports: [TypeOrmModule],
      }
    }
    // By default get service only
    return {
      module: AccountsModule,
      providers: [AccountsService],
      exports: [AccountsService],
    }
  }
}

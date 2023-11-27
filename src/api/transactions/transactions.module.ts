import { DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseModule } from 'src/common/db'
import { Transaction } from '../../entities/transaction.entity'
import { TransactionsController } from './transactions.controller'
import { TransactionRepository } from './transactions.repository'
import { TransactionsService } from './transactions.service'

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionsService, TransactionRepository],
})
export class TransactionsModule {
  static forRoot(options?: {
    controller?: boolean
    repoOnly?: boolean
  }): DynamicModule {
    // get controller and everything
    if (options?.controller) {
      return {
        module: TransactionsModule,
        controllers: [TransactionsController],
        providers: [TransactionsService],
      }
    }
    // Get Repository only
    if (options?.repoOnly) {
      return {
        module: TransactionsModule,
        providers: [TransactionRepository],
        exports: [TransactionRepository],
      }
    }
    // By default get service only
    return {
      module: TransactionsModule,
      providers: [TransactionsService],
      exports: [TransactionsService],
    }
  }
}

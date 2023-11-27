import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, Repository, Transaction } from 'typeorm'

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager())
  }

  findPopulatedByTransactionId(
    transactionId: string,
    dbManager: EntityManager = this.dataSource.manager,
  ) {
    return dbManager
      .createQueryBuilder(Transaction, 'transaction')
      .leftJoin('transaction.account', 'account')
      .leftJoin('transaction.to_account', 'to_account')
      .leftJoin('account.user', 'user')
      .leftJoin('to_account.user', 'to_user')
      .select([
        'transaction.id',
        'transaction.type',
        'transaction.amount',
        'transaction.refunded',
        'transaction.refundable',
        'transaction.created_at',
        'transaction.updated_at',
        'account.id',
        'account.balance',
        'account.active',
        'user.id',
        'user.name',
        'user.created_at',
        'to_account.id',
        'to_account.balance',
        'to_account.active',
        'to_user.id',
        'to_user.name',
        'to_user.created_at',
      ])
      .where('transaction.id = :transaction', { transaction: transactionId })
      .getOne()
  }
}

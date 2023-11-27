import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ErrorCodes, ErrorMessages } from 'src/assets/strings'
import { DatabaseService, ID } from 'src/common/db'
import { PaginatedDto, Pagination } from 'src/common/types'
import { Account } from 'src/entities'
import { Transaction, TransactionType } from '../../entities/transaction.entity'
import { TransactionRepository } from './transactions.repository'

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name)

  @InjectRepository(Transaction)
  private readonly transactionsRepository: TransactionRepository

  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService

  async findAll(pagination: Pagination): Promise<PaginatedDto<Transaction>> {
    this.logger.debug('Finding all transactionss')
    const [items, total] = await this.transactionsRepository
      .createQueryBuilder('transaction')
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
      .orderBy('transaction.created_at', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit)
      .getManyAndCount()

    return {
      total,
      pages: Math.ceil(total / pagination.limit),
      items,
    }
  }

  async findOne(id: ID) {
    this.logger.debug(`Finding transaction with id: ${id}`)
    const transaction = await this.transactionsRepository
      .createQueryBuilder('transaction')
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
      .where('transaction.id = :id', { id })
      .getOne()

    if (!transaction) {
      throw new NotFoundException(
        ErrorMessages.NOT_FOUND_ID('transaction', id),
        {
          description: ErrorCodes.NOT_FOUND,
        },
      )
    }
    return transaction
  }

  async transfer(from: ID, to: ID, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException(ErrorMessages.AMOUNT_MUST_BE_POSITIVE, {
        description: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
      })
    }

    // Create transaction
    const dbTransaction = await this.databaseService.getQueryRunner()

    const fromAccount = await dbTransaction.manager.findOne(Account, {
      where: { id: from },
    })
    if (!fromAccount) {
      throw new NotFoundException(ErrorMessages.FROM_ACCOUNT_DOES_NOT_EXIST, {
        description: ErrorCodes.FROM_ACCOUNT_DOES_NOT_EXIST,
      })
    }
    const toAccount = await dbTransaction.manager.findOne(Account, {
      where: { id: to },
    })
    if (!toAccount) {
      throw new NotFoundException(ErrorMessages.TO_ACCOUNT_DOES_NOT_EXIST, {
        description: ErrorCodes.TO_ACCOUNT_DOES_NOT_EXIST,
      })
    }

    // Check if from account has enough money
    if (fromAccount.balance < amount) {
      throw new BadRequestException(ErrorMessages.NOT_ENOUGH_MONEY, {
        description: ErrorCodes.NOT_ENOUGH_MONEY,
      })
    }
    // Check if to account is active
    if (!toAccount.active) {
      throw new BadRequestException(ErrorMessages.TO_ACCOUNT_INACTIVE, {
        description: ErrorCodes.TO_ACCOUNT_INACTIVE,
      })
    }
    // Withdraw from from account
    fromAccount.balance -= amount
    await dbTransaction.manager.update(
      Account,
      { id: fromAccount.id },
      { balance: fromAccount.balance },
    )

    toAccount.balance += amount
    // Deposit to to account
    await dbTransaction.manager.update(
      Account,
      { id: toAccount.id },
      { balance: toAccount.balance },
    )

    // Create transaction
    const transaction = dbTransaction.manager.create(Transaction, {
      type: TransactionType.TRANSFER,
      amount: Number(amount),
      account: fromAccount,
      refundable: true,
      to_account: toAccount,
    })
    await dbTransaction.manager.insert(Transaction, transaction)

    await dbTransaction.commitTransaction()
    await this.databaseService.releaseQueryRunner(dbTransaction)

    return transaction
  }

  async findAllByUser(
    pagination: Pagination,
    userId: ID,
  ): Promise<PaginatedDto<Transaction>> {
    this.logger.debug(`Finding all transactions by user: ${userId}`)
    const [items, total] = await this.transactionsRepository
      .createQueryBuilder('transaction')
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
      .where('account.user_id = :userId', { userId })
      .orWhere('toAccount.user_id = :userId', { userId })
      .orderBy('transaction.created_at', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit)
      .getManyAndCount()

    return {
      total,
      pages: Math.ceil(total / pagination.limit),
      items,
    }
  }

  async deposit(to: ID, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException(ErrorMessages.AMOUNT_MUST_BE_POSITIVE, {
        description: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
      })
    }

    return this.databaseService.doInTransaction(async manager => {
      const account = await manager.findOne(Account, {
        where: { id: to },
      })
      if (!account) {
        throw new NotFoundException(ErrorMessages.TO_ACCOUNT_DOES_NOT_EXIST, {
          description: ErrorCodes.TO_ACCOUNT_DOES_NOT_EXIST,
        })
      }

      account.balance += amount
      await manager.update(
        Account,
        { id: account.id },
        { balance: account.balance },
      )
      const transaction = manager.create(Transaction, {
        type: TransactionType.DEPOSIT,
        amount,
        account,
      })
      await manager.insert(Transaction, transaction)
      return {
        ...transaction,
        account,
      }
    })
  }

  async withdraw(from: ID, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException(ErrorMessages.AMOUNT_MUST_BE_POSITIVE, {
        description: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
      })
    }

    return this.databaseService.doInTransaction(async manager => {
      const account = await manager.findOne(Account, {
        where: { id: from },
      })
      if (!account) {
        throw new NotFoundException(ErrorMessages.FROM_ACCOUNT_DOES_NOT_EXIST, {
          description: ErrorCodes.FROM_ACCOUNT_DOES_NOT_EXIST,
        })
      }

      if (account.balance < amount) {
        throw new BadRequestException(ErrorMessages.NOT_ENOUGH_MONEY, {
          description: ErrorCodes.NOT_ENOUGH_MONEY,
        })
      }

      account.balance -= amount
      await manager.update(
        Account,
        { id: account.id },
        { balance: account.balance },
      )
      const transaction = manager.create(Transaction, {
        type: TransactionType.WITHDRAWAL,
        amount,
        account,
      })
      await manager.insert(Transaction, transaction)

      return {
        ...transaction,
        account,
      }
    })
  }

  async refund(transactionId: ID) {
    const dbTransaction = await this.databaseService.getQueryRunner()

    const transactionEntity =
      await this.transactionsRepository.findPopulatedByTransactionId(
        transactionId,
        dbTransaction.manager,
      )

    if (!transactionEntity) {
      throw new NotFoundException(
        ErrorMessages.NOT_FOUND_ID('transaction', transactionId),
        {
          description: ErrorCodes.NOT_FOUND,
        },
      )
    }

    // check if its a transfer
    if (!transactionEntity.refundable) {
      throw new BadRequestException(ErrorMessages.REFUND_NOT_ALLOWED, {
        description: ErrorCodes.REFUND_NOT_ALLOWED,
      })
    }

    // check if the transaction is already refunded
    if (transactionEntity.refunded) {
      throw new BadRequestException(ErrorMessages.ALREADY_REFUNDED, {
        description: ErrorCodes.ALREADY_REFUNDED,
      })
    }

    if (!transactionEntity.to_account) {
      throw new BadRequestException(ErrorMessages.TO_ACCOUNT_DOES_NOT_EXIST, {
        description: ErrorCodes.TO_ACCOUNT_DOES_NOT_EXIST,
      })
    }
    if (!transactionEntity.account) {
      throw new BadRequestException(ErrorMessages.FROM_ACCOUNT_DOES_NOT_EXIST, {
        description: ErrorCodes.FROM_ACCOUNT_DOES_NOT_EXIST,
      })
    }
    if (!transactionEntity.account.active) {
      throw new BadRequestException(ErrorMessages.ACCOUNT_INACTIVE, {
        description: ErrorCodes.ACCOUNT_INACTIVE,
      })
    }
    if (!transactionEntity.to_account.active) {
      throw new BadRequestException(ErrorMessages.TO_ACCOUNT_INACTIVE, {
        description: ErrorCodes.TO_ACCOUNT_INACTIVE,
      })
    }

    transactionEntity.to_account.balance -= Number(transactionEntity.amount)
    transactionEntity.account.balance += Number(transactionEntity.amount)

    // start transaction back
    await dbTransaction.manager.update(
      Account,
      { id: transactionEntity.account.id },
      {
        balance: Number(transactionEntity.account.balance),
      },
    )

    await dbTransaction.manager.update(
      Account,
      { id: transactionEntity.to_account.id },
      {
        balance: Number(transactionEntity.to_account.balance),
      },
    )

    await dbTransaction.manager.update(Transaction, transactionId, {
      refunded: true,
    })

    const transactionRefund = dbTransaction.manager.create(Transaction, {
      type: TransactionType.REFUND,
      refundable: false,
      amount: Number(transactionEntity.amount),
      originalTransaction: {
        id: transactionEntity.id,
      },
      account: transactionEntity.account,
      to_account: transactionEntity.to_account,
    })
    await dbTransaction.manager.insert(Transaction, transactionRefund)

    await dbTransaction.commitTransaction()
    await this.databaseService.releaseQueryRunner(dbTransaction)

    return {
      transaction: transactionRefund,
      originalTransaction: transactionEntity,
    }
  }
}

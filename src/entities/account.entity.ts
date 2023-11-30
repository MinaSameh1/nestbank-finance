import { AbstractEntity } from 'src/common/db'
import { User } from 'src/entities/user.entity'
import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Transaction } from '.'

export const AccountType = {
  Checking: 'checking',
  Savings: 'savings',
} as const

export const AccountTypeValues = Object.values(AccountType)
export type AccountTypeValue = (typeof AccountTypeValues)[number]

@Entity()
export class Account extends AbstractEntity {
  @Column({
    unique: true,
    default: () => Math.floor(Math.random() * 1000000000000).toString(),
    nullable: false,
  })
  account_number: string

  @Column()
  balance: number

  @Column({
    default: false,
  })
  active: boolean

  @Column({ enum: AccountTypeValues })
  type: AccountTypeValue

  @ManyToOne(() => User, user => user.accounts)
  @JoinColumn()
  user: User

  @OneToMany(() => Transaction, transaction => transaction.account)
  @JoinColumn()
  transactions: Transaction[]

  static fromPartial(data: DeepPartial<Account>): Account {
    return Object.assign(new Account(), data)
  }

  static getAccounts({
    limit,
    skip,
  }: {
    limit?: number
    skip?: number
  }): Promise<[Account[], number]> {
    return Account.createQueryBuilder('account')
      .innerJoinAndSelect('account.user', 'user')
      .select([
        'account.id',
        'account.type',
        'account.active',
        'account.balance',
        'account.account_number',
        'account.updated_at',
        'account.created_at',
        'account.deleted_at',
        'user.id',
        'user.name',
        'user.created_at',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('account.created_at', 'DESC')
      .getManyAndCount()
  }

  static getAccount(id: string): Promise<Account | null> {
    return Account.createQueryBuilder('account')
      .innerJoinAndSelect('account.user', 'user')
      .select([
        'account.id',
        'account.type',
        'account.active',
        'account.balance',
        'account.account_number',
        'account.updated_at',
        'account.created_at',
        'account.deleted_at',
        'user.id',
        'user.name',
        'user.created_at',
      ])
      .where('account.id = :id', { id })
      .getOne()
  }

  static getAccountsWithUser(
    userId: string,
    {
      limit,
      skip,
    }: {
      limit?: number
      skip?: number
    },
  ): Promise<[Account[], number]> {
    return Account.createQueryBuilder('account')
      .innerJoinAndSelect('account.user', 'user')
      .select([
        'account.id',
        'account.type',
        'account.active',
        'account.balance',
        'account.account_number',
        'account.updated_at',
        'account.created_at',
        'account.deleted_at',
        'user.id',
        'user.name',
        'user.created_at',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('account.created_at', 'DESC')
      .where('user.id = :userId', { userId })
      .getManyAndCount()
  }
}

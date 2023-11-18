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
    default: () => Math.floor(Math.random() * 10000000000000000).toString(),
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
}

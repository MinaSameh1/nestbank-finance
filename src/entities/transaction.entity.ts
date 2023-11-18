import { ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from 'src/common/db'
import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm'
import { Account } from './account.entity'

export const TransactionType = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  REFUND: 'refund',
} as const

export const TransactionTypeValues = Object.values(TransactionType)
export type TransactionTypeValue = (typeof TransactionTypeValues)[number]

@Entity()
export class Transaction extends AbstractEntity {
  @Column({ enum: TransactionTypeValues })
  @ApiProperty({ enum: TransactionTypeValues })
  type: TransactionTypeValue

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty()
  amount: number

  @Column({ default: false })
  @ApiProperty({ default: false })
  refunded: boolean

  @Column({ default: false })
  @ApiProperty({ default: false })
  refundable: boolean

  @ApiProperty({ nullable: true })
  @OneToOne(() => Transaction)
  originalTransaction?: Transaction

  @ManyToOne(() => Account, account => account.transactions)
  @JoinColumn()
  account: Account

  // If the transaction is a transfer, then this is the account that the money is going to
  @ManyToOne(() => Account, account => account.transactions)
  @JoinColumn()
  to_account?: Account

  static fromPartial(data: DeepPartial<Transaction>): Transaction {
    return Object.assign(new Transaction(), data)
  }
}

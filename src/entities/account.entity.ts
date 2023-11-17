import { AbstractEntity } from 'src/common/db'
import { User } from 'src/entities/user.entity'
import { Column, DeepPartial, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Transaction } from './transaction.entity'

@Entity()
export class Account extends AbstractEntity {
  @Column()
  balance: number

  @ManyToOne(() => User, user => user.accounts)
  user: User

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions: Transaction[]
  static fromPartial(data: DeepPartial<Account>): Account {
    return Object.assign(new Account(), data)
  }
}

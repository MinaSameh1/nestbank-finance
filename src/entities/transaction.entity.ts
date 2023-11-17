import { ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from 'src/common/db'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Account } from './account.entity'

@Entity()
export class Transaction extends AbstractEntity {
  @Column()
  @ApiProperty()
  type: string // 'deposit', 'withdrawal', 'transfer'

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty()
  amount: number

  @ManyToOne(() => Account, account => account.transactions)
  account: Account
}

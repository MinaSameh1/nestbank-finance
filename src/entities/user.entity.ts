import { ApiProperty } from '@nestjs/swagger'
import { AbstractEntity } from 'src/common/db'
import { Column, DeepPartial, Entity, JoinTable, OneToMany } from 'typeorm'
import { Account } from './account.entity'

@Entity()
export class User extends AbstractEntity {
  @Column()
  @ApiProperty()
  name: string

  @OneToMany(() => Account, account => account.user)
  @JoinTable({ name: 'user_accounts' })
  accounts: Account[]

  static fromPartial(data: DeepPartial<User>): User {
    return Object.assign(new User(), data)
  }
}

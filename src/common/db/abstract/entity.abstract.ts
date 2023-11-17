import { ApiProperty } from '@nestjs/swagger'
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '435d5c44-d360-4f50-a172-e83ccc905c27' })
  id: string

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  created: Date

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  updated: Date

  @DeleteDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  deleted: Date
}

import { ApiProperty } from '@nestjs/swagger'
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '435d5c44-d360-4f50-a172-e83ccc905c27' })
  id: string

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  updated_at: Date

  @DeleteDateColumn({ type: 'timestamp' })
  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  deleted_at: Date | null
}

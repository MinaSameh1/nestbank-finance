import { ApiProperty } from '@nestjs/swagger'
import { Transaction } from 'src/entities'

export class RefundResponse {
  @ApiProperty()
  originalTransaction: Transaction
  @ApiProperty()
  transaction: Transaction
}

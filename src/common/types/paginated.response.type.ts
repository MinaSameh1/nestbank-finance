import { ApiProperty } from '@nestjs/swagger'

export class PaginatedDto<TData> {
  @ApiProperty({ example: 1 })
  total: number
  @ApiProperty({ example: 1 })
  pages: number

  @ApiProperty()
  items: TData[]
}

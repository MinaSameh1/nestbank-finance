import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsUUID, Max, Min } from 'class-validator'
import { AccountType, AccountTypeValue, AccountTypeValues } from 'src/entities'

export class CreateAccountDto {
  @ApiProperty({ example: 5000, minimum: 5000, maximum: 100000 })
  @IsNumber()
  @Max(100000)
  @Min(5000)
  balance = 5000

  @IsEnum(AccountTypeValues)
  @ApiProperty({ enum: AccountTypeValues, example: AccountType.Checking })
  type: AccountTypeValue

  @IsUUID()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string
}

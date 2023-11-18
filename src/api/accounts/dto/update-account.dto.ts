import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { CreateAccountDto } from './create-account.dto'

export class UpdateAccountDto extends PartialType(
  OmitType(CreateAccountDto, ['userId', 'balance']),
) {
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  active: boolean
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ErrorCodes } from 'src/assets/strings'
import { ID } from 'src/common/db'
import {
  IdParam,
  Paginate,
  SwaggerDocumentation,
  SwaggerDocumentationPaginationQuery,
} from 'src/common/decorators'
import { PaginatedDto, Pagination } from 'src/common/types'
import { Account } from 'src/entities'
import { AccountsService } from './accounts.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @SwaggerDocumentation({
    summary: 'Create account',
    description: `Creates a new Account for the user with the given id.   
If the user already has an account of the same type, it will throw an error.  

## User Story:
- As a bank I want to create a new account for a user so that they can use it to deposit and withdraw money
- As a bank I want to have multiple types of accounts so that users can choose the one that fits their needs (e.g. savings, checking, etc.)

## Flow:
- Users goes to the bank and asks to create a new account 
- Bank Validates the user's information 
- Bank creates a new account for the user and gives them the account number and other information 
- Bank gives user the account information and asks them to deposit money to activate the account

## Error Codes:
- \`${ErrorCodes.ACCOUNT_ALREADY_EXISTS}\` - User already has an account of the same type   
- \`${ErrorCodes.USER_DOES_NOT_EXIST}\` - User does not exist  
`,
    badRequestDescription: 'User already has an account of the same type',
    okDescription: 'account created',
    status: HttpStatus.CREATED,
    okType: Account,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User does not exist',
  })
  @ApiBody({
    type: CreateAccountDto,
    examples: {
      checking: {
        description: 'Create a checking account',
        value: {
          balance: 5000,
          type: 'checking',
          userId: '010e97d7-23cf-40f9-afb4-99cc565c74f1',
        },
      },
      savings: {
        description: 'Create a savings account',
        value: {
          balance: 5000,
          type: 'savings',
          userId: '010e97d7-23cf-40f9-afb4-99cc565c74f1',
        },
      },
    },
  })
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(
      createAccountDto,
      createAccountDto.userId,
    )
  }

  @SwaggerDocumentation({
    summary: 'Find all accounts',
    okDescription: 'Return all accounts',
    badRequestDescription: 'Invalid pagination query',
    paginated: true,
    okType: Account,
  })
  @SwaggerDocumentationPaginationQuery()
  @Get()
  findAll(@Paginate() pagination: Pagination): Promise<PaginatedDto<Account>> {
    return this.accountsService.findAll(pagination)
  }

  @SwaggerDocumentation({
    summary: 'Find one account',
    okDescription: 'Return one account',
    badRequestDescription: 'Invalid account id',
    okType: Account,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Get(':id')
  findOne(@IdParam('id') id: ID) {
    return this.accountsService.findOne(id)
  }

  @SwaggerDocumentation({
    summary: 'Update one account',
    okDescription: 'Return success message with',
    badRequestDescription: 'Invalid account id',
    okType: Account,
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Patch(':id')
  update(@IdParam('id') id: ID, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto)
  }

  @SwaggerDocumentation({
    summary: 'Activates/deactivates one account',
    description: `Activates/deactivates one account.  
Can be used to close an account or to reopen it.
`,
    okDescription: 'Returns updated account',
    badRequestDescription: 'Invalid account id',
    okType: Account,
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Patch(':id/active')
  updateStatus(@IdParam('id') id: ID) {
    return this.accountsService.switchStatus(id)
  }

  @SwaggerDocumentation({
    summary: 'Remove one account',
    okDescription: 'Return success message',
    badRequestDescription: 'Invalid account id',
    okType: Account,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Delete(':id')
  remove(@IdParam('id') id: ID) {
    return this.accountsService.remove(id)
  }
}

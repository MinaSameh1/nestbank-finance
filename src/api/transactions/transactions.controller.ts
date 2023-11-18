import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { ErrorCodes } from 'src/assets/strings'
import { ID } from 'src/common/db'
import {
  IdParam,
  Paginate,
  SwaggerDocumentation,
  SwaggerDocumentationPaginationQuery,
} from 'src/common/decorators'
import { PaginatedDto, Pagination } from 'src/common/types'
import { Transaction } from '../../entities/transaction.entity'
import { TransactionsService } from './transactions.service'
import { RefundResponse } from './types/Response.type'

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @SwaggerDocumentation({
    summary: 'Find all transactions',
    okDescription: 'Return all transactions',
    badRequestDescription: 'Invalid pagination query',
    paginated: true,
    okType: Transaction,
  })
  @SwaggerDocumentationPaginationQuery()
  @Get()
  findAll(
    @Paginate() pagination: Pagination,
  ): Promise<PaginatedDto<Transaction>> {
    return this.transactionsService.findAll(pagination)
  }

  @SwaggerDocumentation({
    summary: 'Find one transaction',
    okDescription: 'Return one transaction',
    badRequestDescription: 'Invalid transaction id',
    okType: Transaction,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @Get(':id')
  findOne(@IdParam('id') id: ID) {
    return this.transactionsService.findOne(id)
  }

  @SwaggerDocumentation({
    summary: 'Find all transactions by user',
    okDescription: 'Return all transactions by user',
    badRequestDescription: 'Invalid pagination query',
    paginated: true,
    okType: Transaction,
  })
  @SwaggerDocumentationPaginationQuery()
  @Get('user/:userId')
  findAllByUser(
    @Paginate() pagination: Pagination,
    @IdParam('userId') userId: ID,
  ): Promise<PaginatedDto<Transaction>> {
    return this.transactionsService.findAllByUser(pagination, userId)
  }

  @SwaggerDocumentation({
    summary: 'Transfer money between accounts',
    description: `

## User story:
- As a user, I want to transfer money between accounts   
- As a Bank, I want to allow users to transfer money between accounts  

## Error codes:
\`${ErrorCodes.AMOUNT_MUST_BE_POSITIVE}\` => Amount must be positive, cannot be 0 or negative   
\`${ErrorCodes.FROM_ACCOUNT_DOES_NOT_EXIST}\` => From account does not exist   
\`${ErrorCodes.TO_ACCOUNT_DOES_NOT_EXIST}\` => To account does not exist   
\`${ErrorCodes.NOT_ENOUGH_MONEY}\` => From account does not have enough money to transfer
    `,
    okDescription: 'Return the transaction',
    badRequestDescription: 'Invalid transaction data',
    okType: Transaction,
  })
  @ApiParam({
    name: 'from',
    description: 'Account that is sending the money',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'to',
    description: 'Account that is reciving the money',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'amount',
    description: 'Amount to transfer, Must be a positive number',
    type: Number,
    required: true,
  })
  @Put('transfer/:from/:to/:amount')
  transfer(
    @IdParam('from') from: ID,
    @IdParam('to') to: ID,
    @Param('amount', new ParseIntPipe()) amount: number,
  ) {
    return this.transactionsService.transfer(from, to, amount)
  }

  @SwaggerDocumentation({
    summary: 'Deposit money into an account',
    description: `
## User story:
- As a user, I want to deposit money into an account  
- As a Bank, I want to allow users to deposit money into an account  

## Error codes:
\`${ErrorCodes.AMOUNT_MUST_BE_POSITIVE}\` => Amount must be positive, cannot be 0 or negative   
\`${ErrorCodes.TO_ACCOUNT_DOES_NOT_EXIST}\` => To account does not exist   
`,
    okDescription: 'Return the transaction',
    badRequestDescription: 'Invalid transaction data',
    okType: Transaction,
  })
  @ApiParam({
    name: 'to',
    description: 'Account that is depositing the money',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'amount',
    type: Number,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('deposit/:to/:amount')
  deposit(
    @IdParam('to') to: ID,
    @Param('amount', new ParseIntPipe()) amount: number,
  ) {
    return this.transactionsService.deposit(to, amount)
  }

  @SwaggerDocumentation({
    summary: 'Withdraw money from an account',
    okDescription: 'Return the transaction',
    description: `

## User story:
- As a user, I want to withdraw money from an account (My accounts!)
- As a Bank, I want to allow users to withdraw money from their accounts
- As a bank, I want to widthdraw fees from the account

## Error codes:
\`${ErrorCodes.AMOUNT_MUST_BE_POSITIVE}\` => Amount must be positive, cannot be 0 or negative   
\`${ErrorCodes.FROM_ACCOUNT_DOES_NOT_EXIST}\` => From account does not exist   
\`${ErrorCodes.NOT_ENOUGH_MONEY}\` => From account does not have enough money to transfer
    `,
    badRequestDescription: 'Invalid transaction data',
    okType: Transaction,
  })
  @ApiParam({
    name: 'from',
    description: 'Account that is withdrawing the money',
    type: String,
    required: true,
  })
  @ApiParam({
    name: 'amount',
    type: Number,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('withdraw/:from/:amount')
  withdraw(
    @IdParam('from') from: ID,
    @Param('amount', new ParseIntPipe()) amount: number,
  ) {
    return this.transactionsService.withdraw(from, amount)
  }

  @SwaggerDocumentation({
    summary: 'Refund a transaction',
    description: `

## User story:
- As a user, I want to refund a transaction   
- As a Bank, I want to allow users to refund a transaction  

## Error codes:
\`${ErrorCodes.ALREADY_REFUNDED}\` => Transaction already refunded  
\`${ErrorCodes.REFUND_NOT_ALLOWED}\` => Refund not allowed, only transfers can be refunded   
\`${ErrorCodes.NOT_FOUND}\` => Transaction not found   
\`${ErrorCodes.TO_ACCOUNT_DOES_NOT_EXIST}\` => To account does not exist  
\`${ErrorCodes.FROM_ACCOUNT_DOES_NOT_EXIST}\` => From account does not exist   
\`${ErrorCodes.TO_ACCOUNT_INACTIVE}\` => Reciving Account is inactive, cannot transfer money   
\`${ErrorCodes.FROM_ACCOUNT_INACTIVE}\` => account that made the transaction is inactive, cannot transfer money  
    `,
    okDescription: 'Return the transaction',
    badRequestDescription: 'Invalid transaction data',
    okType: RefundResponse,
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction to refund',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('refund/:transactionId')
  refund(@IdParam('transactionId') transaction: ID) {
    return this.transactionsService.refund(transaction)
  }
}

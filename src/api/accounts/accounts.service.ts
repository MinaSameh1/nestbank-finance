import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ErrorCodes, ErrorMessages, SuccessMessages } from 'src/assets/strings'
import { DatabaseService, ID } from 'src/common/db'
import { PaginatedDto, Pagination } from 'src/common/types'
import { Account, User } from 'src/entities'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name)

  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService

  async create(createAccountDto: CreateAccountDto, userId: ID) {
    this.logger.debug('Creating a new account')

    const account = Account.create({
      ...createAccountDto,
      user: {
        id: userId,
      },
    })

    // Check first that user exists
    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_DOES_NOT_EXIST, {
        description: ErrorCodes.USER_DOES_NOT_EXIST,
      })
    }

    // Check if user has an account already
    const accountExists = await Account.findOne({
      where: {
        type: account.type,
        user: {
          id: userId,
        },
      },
    })

    if (accountExists) {
      throw new BadRequestException(ErrorMessages.ACCOUNT_ALREADY_EXISTS, {
        description: ErrorCodes.ACCOUNT_ALREADY_EXISTS,
      })
    }

    await Account.insert(account)

    return account
  }

  async findAll(pagination: Pagination): Promise<PaginatedDto<Account>> {
    this.logger.debug('Finding all accountss')
    const [items, total] = await Account.getAccounts({
      limit: pagination.limit,
      skip: pagination.skip,
    })

    return {
      total,
      pages: Math.ceil(total / pagination.limit),
      items,
    }
  }

  async findOne(id: ID) {
    this.logger.debug(`Finding account with id: ${id}`)
    const account = await Account.getAccount(id)

    if (!account) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('account', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return account
  }

  async update(id: ID, updateAccountDto: UpdateAccountDto) {
    this.logger.debug(`Updating account with id: ${id}`)
    if ((updateAccountDto as any).userId) {
      // Force Check, just in case!
      throw new BadRequestException(ErrorMessages.CANNOT_UPDATE_USER_ID, {
        description: ErrorCodes.CANNOT_UPDATE_USER_ID,
      })
    }

    // check that account exists
    const account = await Account.findOne({ where: { id } })
    if (!account) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('account', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }

    const updateResult = await Account.update({ id }, updateAccountDto)

    if (!(updateResult.affected === 1)) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('account', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_UPDATED_ID('account', id),
    }
  }

  async remove(id: ID) {
    this.logger.debug(`Removing account with id: ${id}`)
    // check that account exists
    const account = await Account.findOneBy({ id })
    if (!account) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('account', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }

    // This doesn't check if account exists
    const updateResult = await Account.update(
      { id },
      { deleted_at: new Date() },
    )
    if (!(updateResult.affected === 1)) {
      throw new ConflictException(ErrorMessages.NOT_FOUND_ID('account', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_DELETED_ID('account', id),
    }
  }

  async switchStatus(id: ID): Promise<Account> {
    this.logger.debug(`Switching status of account with id: ${id}`)
    return this.databaseService.doInTransaction(
      async (manager): Promise<Account> => {
        this.logger.debug(`Switching status of account with id: ${id}`)
        const account = await manager.findOne(Account, { where: { id } })
        if (!account) {
          throw new NotFoundException(
            ErrorMessages.NOT_FOUND_ID('account', id),
            {
              description: ErrorCodes.NOT_FOUND,
            },
          )
        }
        await manager.update(Account, { id }, { active: !account.active })
        account.active = !account.active
        return account
      },
    )
  }

  async findManyByUser(userId: ID, pagination: Pagination) {
    this.logger.debug(`Finding accounts for user with id: ${userId}`)
    const [accounts, total] = await Account.getAccountsWithUser(userId, {
      limit: pagination.limit,
      skip: pagination.skip,
    })

    return {
      total: total,
      pages: Math.ceil(total / 10),
      items: accounts,
    }
  }
}

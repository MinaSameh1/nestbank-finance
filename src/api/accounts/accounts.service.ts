import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ErrorCodes, ErrorMessages, SuccessMessages } from 'src/assets/strings'
import { DatabaseService, ID } from 'src/common/db'
import { PaginatedDto, Pagination } from 'src/common/types'
import { Account, User } from 'src/entities'
import { Repository } from 'typeorm'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name)

  @InjectRepository(Account)
  private readonly accountsRepository: Repository<Account>

  @Inject(DatabaseService)
  private readonly databaseService: DatabaseService

  @InjectRepository(User)
  private readonly usersRepository: Repository<User>

  async create(createAccountDto: CreateAccountDto, userId: ID) {
    this.logger.debug('Creating a new account')

    const account = this.accountsRepository.create({
      ...createAccountDto,
      user: {
        id: userId,
      },
    })

    // Check first that user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_DOES_NOT_EXIST, {
        description: ErrorCodes.USER_DOES_NOT_EXIST,
      })
    }

    // Check if user has an account already
    const accountExists = await this.accountsRepository.findOne({
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

    await this.accountsRepository.insert(account)

    return account
  }

  async findAll(pagination: Pagination): Promise<PaginatedDto<Account>> {
    this.logger.debug('Finding all accountss')
    const [items, total] = await this.accountsRepository
      .createQueryBuilder('account')
      .skip(pagination.skip)
      .take(pagination.limit)
      .innerJoin('account.user', 'user')
      .select([
        'account.id',
        'account.type',
        'account.active',
        'account.balance',
        'account.account_number',
        'account.updated_at',
        'account.created_at',
        'account.deleted_at',
        'user.id',
        'user.name',
        'user.created_at',
      ])
      .getManyAndCount()

    return {
      total,
      pages: Math.ceil(total / pagination.limit),
      items,
    }
  }

  async findOne(id: ID) {
    this.logger.debug(`Finding account with id: ${id}`)
    const account = await this.accountsRepository
      .createQueryBuilder('account')
      .innerJoin('account.user', 'user')
      .select([
        'account.id',
        'account.type',
        'account.active',
        'account.balance',
        'account.account_number',
        'account.updated_at',
        'account.created_at',
        'account.deleted_at',
        'user.id',
        'user.name',
        'user.created_at',
      ])
      .where('account.id = :id', { id })
      .getOne()
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
    const updateResult = await this.accountsRepository.update(
      { id },
      updateAccountDto,
    )
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
    const deleteResult = await this.accountsRepository.softDelete({ id })
    if (!(deleteResult.affected === 1)) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('account', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_DELETED_ID('account', id),
    }
  }

  async switchStatus(id: ID) {
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
        return {
          ...account,
          active: !account.active,
        }
      },
    )
  }

  async findManyByUser(userId: ID, pagination: Pagination) {
    this.logger.debug(`Finding accounts for user with id: ${userId}`)
    const [accounts, total] = await this.accountsRepository
      .createQueryBuilder('account')
      .skip(pagination.skip)
      .take(pagination.limit)
      .innerJoin('account.user', 'user')
      .select([
        'account.id',
        'account.type',
        'account.active',
        'account.balance',
        'account.account_number',
        'account.updated_at',
        'account.created_at',
        'account.deleted_at',
        'user.id',
        'user.name',
        'user.created_at',
      ])
      .where('user.id = :userId', { userId })
      .getManyAndCount()

    return {
      total: total,
      pages: Math.ceil(total / 10),
      items: accounts,
    }
  }
}

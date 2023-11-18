import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ErrorCodes, ErrorMessages, SuccessMessages } from 'src/assets/strings'
import { ID } from 'src/common/db'
import { PaginatedDto, Pagination } from 'src/common/types'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  @InjectRepository(User) private readonly usersRepository: Repository<User>

  async create(createUserDto: CreateUserDto) {
    this.logger.debug('Creating a new user')
    const user = this.usersRepository.create(createUserDto)
    await this.usersRepository.insert(user)
    return user
  }

  async findAll(pagination: Pagination): Promise<PaginatedDto<User>> {
    this.logger.debug('Finding all userss')
    const [items, total] = await this.usersRepository
      .createQueryBuilder('user')
      .skip(pagination.skip)
      .take(pagination.limit)
      .leftJoin('user.accounts', 'account', 'account.deleted_at IS NULL')
      .select([
        'user.id',
        'user.name',
        'user.created_at',
        'user.updated_at',
        'user.deleted_at',
        'account.id',
      ])
      .addOrderBy('user.created_at', 'DESC')
      .getManyAndCount()

    return {
      total,
      pages: Math.ceil(total / pagination.limit),
      items,
    }
  }

  async findOne(id: ID) {
    this.logger.debug(`Finding user with id: ${id}`)
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('user', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return user
  }

  async update(id: ID, updateUserDto: UpdateUserDto) {
    this.logger.debug(`Removing user with id: ${id}`)
    const userExists = await this.usersRepository.update({ id }, updateUserDto)
    if (!(userExists.affected === 1)) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('user', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_UPDATED_ID('user', id),
    }
  }

  async remove(id: ID) {
    this.logger.debug(`Removing user with id: ${id}`)
    const deleteResult = await this.usersRepository.softDelete({ id })
    if (!(deleteResult.affected === 1)) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('user', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_DELETED_ID('user', id),
    }
  }
}

import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { MockUserRepository } from 'src/api/users/tests/users.repository.mock'
import { ErrorCodes, ErrorMessages } from 'src/assets/strings'
import { DatabaseService } from 'src/common/db'
import { User } from 'src/entities'
import { Repository } from 'typeorm'
import { Account } from '../../../entities/account.entity'
import { AccountsService } from '../accounts.service'
import { MockAccountRepository } from './accounts.repository.mock'
import {
  generateFakeAccount,
  generateFakeAccounts,
  setUpUserForUserId,
} from './accounts.test.helper'

describe('AccountsService', () => {
  let service: AccountsService
  let repository: Repository<Account>
  let userRepository: Repository<User>
  const databaseService = {
    findOne: jest.fn((_entity, id) => repository.findOne(id)),
    update: jest.fn((_entity, id, data) => repository.update(id, data)),
    doInTransaction: jest.fn(cb => {
      return cb({
        update: databaseService.update,
        findOne: databaseService.findOne,
      })
    }),
  }

  let getManyAndCount: jest.Mock = jest.fn().mockReturnValue([[], 0])
  let getOne: jest.Mock = jest.fn().mockReturnValue(undefined)
  const createQueryBuilder = jest.fn(() => ({
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getManyAndCount,
    getOne,
  }))

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: DatabaseService,
          useValue: databaseService,
        },
        {
          provide: getRepositoryToken(Account),
          useClass: MockAccountRepository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: MockUserRepository,
        },
      ],
    }).compile()

    service = module.get<AccountsService>(AccountsService)
    repository = module.get<Repository<Account>>(getRepositoryToken(Account))
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    await repository.clear()
    await userRepository.clear()
    databaseService.doInTransaction.mockClear()
    repository.createQueryBuilder = createQueryBuilder as any
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Find', () => {
    it('should return accounts', async () => {
      const itemToBeSaved = repository.create(generateFakeAccount())
      await repository.save(itemToBeSaved)

      getManyAndCount = jest.fn().mockReturnValue([
        [
          {
            ...itemToBeSaved,
            user: {},
          },
        ],
        1,
      ])
      const items = await service.findAll({
        limit: 10,
        page: 1,
        skip: 0,
      })

      expect(items).toMatchObject({
        pages: 1,
        total: 1,
        items: [
          {
            ...itemToBeSaved,
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
            deleted_at: null,
          },
        ],
      })
      expect(items.items[0]).toHaveProperty('id')
      expect(items.items[0]).toHaveProperty('user')
    })

    it('Should get account', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check

      const itemToBeSaved = generateFakeAccount()
      const item = await service.create(itemToBeSaved, user.id)

      getOne = jest.fn().mockReturnValue({
        ...item,
        user: {
          id: user.id,
          name: user.name,
          created_at: user.created_at,
        },
      })

      expect(item).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(item).toHaveProperty('id')

      const oldItem = await service.findOne(item.id)
      expect(oldItem).toMatchObject(item)
    })

    it('should return accounts using userId', async () => {
      const user = await setUpUserForUserId(userRepository)
      const itemToBeSaved = repository.create(
        generateFakeAccount({
          user: { id: user.id, name: user.name, created_at: user.created_at },
        } as any),
      )
      await repository.save(itemToBeSaved)
      const accounts = generateFakeAccounts(9, {
        user: {
          id: user.id,
          name: user.name,
          created_at: user.created_at,
        },
      })

      getManyAndCount = jest.fn().mockReturnValue([
        [
          {
            ...itemToBeSaved,
          },
          ...accounts,
        ],
        accounts.length + 1,
      ])
      const items = await service.findManyByUser(user.id, {
        limit: 10,
        page: 1,
        skip: 0,
      })

      expect(items.pages).toEqual(1)
      expect(items.total).toEqual(accounts.length + 1)
      expect(items.items).toBeInstanceOf(Array)
      expect(items.items.length).toEqual(accounts.length + 1)
      expect(items.items[0]).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(items.items[0]).toHaveProperty('id')
      expect(items.items[0]).toHaveProperty('user')
    })
  })

  describe('Create', () => {
    it('should create account', async () => {
      const itemToBeSaved = generateFakeAccount()
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check

      const item = await service.create(itemToBeSaved, user.id)

      expect(item).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('created_at')
    })

    it('should failt to create account if user doesnt exist', async () => {
      const itemToBeSaved = generateFakeAccount()

      try {
        await service.create(itemToBeSaved, randomUUID())
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException)
        expect(err.message).toEqual(ErrorMessages.USER_DOES_NOT_EXIST)
        expect(err.status).toEqual(404)
        expect(err.options.description).toEqual(ErrorCodes.USER_DOES_NOT_EXIST)
      }
    })
  })

  describe('Update', () => {
    it('Should update account', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check
      const itemToBeSaved = generateFakeAccount({
        userId: user.id,
      })

      const item = await service.create(itemToBeSaved, user.id)
      expect(item).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('created_at')

      const itemToBeUpdated = generateFakeAccount({
        userId: undefined,
      })
      const newItem = await service.update(item.id, itemToBeUpdated as any)
      expect(newItem.message.includes('Successfully Updated')).toBeTruthy()
    })

    it('Should fail to update account if it doesnt exist', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check
      const itemToBeSaved = generateFakeAccount({
        userId: user.id,
      })

      const item = repository.create(itemToBeSaved)
      expect(item).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('created_at')

      const itemToBeUpdated = generateFakeAccount({
        userId: undefined,
      })
      try {
        await service.update(item.id, itemToBeUpdated as any)
      } catch (err) {
        expect(err.message.includes('Successfully Updated')).toBeFalsy()
        expect(err).toBeInstanceOf(NotFoundException)
        expect(err.message).toEqual(
          ErrorMessages.NOT_FOUND_ID('account', item.id),
        )
        expect(err.status).toEqual(404)
        expect(err.options.description).toEqual(ErrorCodes.NOT_FOUND)
      }
    })

    it('Should update status', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check

      const itemToBeSaved = generateFakeAccount()
      const item = await service.create(itemToBeSaved, user.id)
      expect(item).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(item).toHaveProperty('id')

      const oldItem = await service.switchStatus(item.id)
      expect(oldItem).toMatchObject({
        ...itemToBeSaved,
        active: !item.active,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })

      expect(databaseService.doInTransaction).toHaveBeenCalledTimes(1)
      expect(databaseService.update).toHaveBeenCalledTimes(1)
      expect(databaseService.findOne).toHaveBeenCalledWith(Account, {
        where: { id: item.id },
      })
      expect(databaseService.update).toHaveBeenCalledWith(
        Account,
        { id: item.id },
        { active: !item.active },
      )
    })
  })

  it('Should delete account', async () => {
    const user = await setUpUserForUserId(userRepository)
    expect(user).toHaveProperty('id') // sanity check

    const itemToBeSaved = generateFakeAccount()
    const item = await service.create(itemToBeSaved, user.id)
    expect(item).toMatchObject({
      ...itemToBeSaved,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      deleted_at: null,
    })
    expect(item).toHaveProperty('id')

    repository.createQueryBuilder = createQueryBuilder as any
    getOne = jest.fn().mockReturnValue({
      ...item,
      deleted_at: new Date(),
      user: {
        id: user.id,
        name: user.name,
        created_at: user.created_at,
      },
    })
    const oldItem = await service.remove(item.id)
    expect(oldItem.message.includes('Successfully Deleted')).toBeTruthy()
    const deletedItem = await service.findOne(item.id)
    expect(deletedItem?.deleted_at).toBeTruthy()
  })
})

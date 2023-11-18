import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MockUserRepository } from 'src/api/users/tests/users.repository.mock'
import { DatabaseService } from 'src/common/db'
import { Account, User } from 'src/entities'
import { Repository } from 'typeorm'
import { AccountsController } from '../accounts.controller'
import { AccountsService } from '../accounts.service'
import { MockAccountRepository } from './accounts.repository.mock'
import {
  generateFakeAccount,
  generateFakeAccounts,
  setUpUserForUserId,
} from './accounts.test.helper'

describe('AccountsController', () => {
  let controller: AccountsController
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
  const getOne: jest.Mock = jest.fn().mockReturnValue(undefined)
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
      controllers: [AccountsController],
      providers: [
        AccountsService,
        {
          provide: DatabaseService,
          useValue: databaseService,
        },
        {
          provide: getRepositoryToken(User),
          useClass: MockUserRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useClass: MockAccountRepository,
        },
      ],
    }).compile()

    controller = module.get<AccountsController>(AccountsController)
    repository = module.get<Repository<Account>>(getRepositoryToken(Account))
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    repository.createQueryBuilder = createQueryBuilder as any
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('Create', () => {
    it('should create a account', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check
      const itemToBeSaved = generateFakeAccount({
        userId: user.id,
      })
      const account = await controller.create(itemToBeSaved)
      expect(account).toHaveProperty('id')
      expect(account).toHaveProperty('created_at')
    })
  })

  describe('Find', () => {
    it('should return an array of accounts', async () => {
      const itemToBeSaved = generateFakeAccount()
      const item = await repository.save(repository.create(itemToBeSaved))
      expect(item).toHaveProperty('id')
      const accounts = generateFakeAccounts(14)
      await repository.save(repository.create(accounts))

      const returnValue = accounts.splice(0, 4).map(account => ({
        ...account,
        user: [] as any,
      }))

      returnValue.unshift({
        ...item,
        user: {
          id: '010e97d7-23cf-40f9-afb4-99cc565c74f1',
          created_at: '2023-11-17T12:29:31.476Z',
          name: 'string',
        } as any,
      } as any)
      getManyAndCount = jest.fn().mockReturnValue([returnValue, 15])

      const items = await controller.findAll({
        page: 1,
        limit: 5,
        skip: 0,
      })
      expect(items.items).toBeInstanceOf(Array)
      expect(items.items.length).toBeGreaterThanOrEqual(1)
      expect(items.items[0]).toMatchObject(item)
      expect(items.total).toEqual(15)
      expect(items.pages).toEqual(3)
    })

    it('should return a account', async () => {
      const newAccount = await repository.save(
        repository.create(generateFakeAccount()),
      )
      expect(newAccount).toHaveProperty('id')

      getOne.mockReturnValue({
        ...newAccount,
        user: {
          id: '010e97d7-23cf-40f9-afb4-99cc565c74f1',
          created_at: '2023-11-17T12:29:31.476Z',
          name: 'string',
        },
      })
      const account = await controller.findOne(newAccount.id)
      expect(account).toMatchObject(newAccount)
      expect(account).toHaveProperty('user')
      expect(account.user).toHaveProperty('id')
    })

    it('Should throw error when account not found', async () => {
      try {
        await controller.findOne('123')
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.response).toHaveProperty('statusCode')
        expect(error.response.statusCode).toEqual(404)
        expect(error.response).toHaveProperty('message')
        expect(error.response.message.includes('Not Found')).toBeTruthy()
      }
    })

    it('Should get accounts using user', async () => {
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
      const items = await controller.findUsingUser(user.id, {
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

  describe('Update', () => {
    it('should update a account', async () => {
      const newAccount = await repository.save(
        repository.create(generateFakeAccount()),
      )
      expect(newAccount).toHaveProperty('id')

      const account = await controller.update(newAccount.id, {
        active: !newAccount.active,
      })

      expect(account).toHaveProperty('message')
      expect(account.message.includes('Successfully Updated')).toBeTruthy()
    })

    it('Should throw error when account not found', async () => {
      try {
        await controller.update('123', {
          active: true,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.response).toHaveProperty('statusCode')
        expect(error.response.statusCode).toEqual(404)
        expect(error.response).toHaveProperty('message')
        expect(error.response.message.includes('Not Found')).toBeTruthy()
      }
    })

    it('Should update status', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check

      const itemToBeSaved = generateFakeAccount({
        userId: user.id,
      })
      const item = await repository.save(repository.create(itemToBeSaved))
      expect(item).toMatchObject({
        ...itemToBeSaved,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: null,
      })
      expect(item).toHaveProperty('id')

      const oldItem = await controller.updateStatus(item.id)
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

  describe('Delete', () => {
    it('should delete a account', async () => {
      const newAccount = await repository.save(
        repository.create(generateFakeAccount()),
      )
      expect(newAccount).toHaveProperty('id')

      const account = await controller.remove(newAccount.id)

      expect(account).toHaveProperty('message')
      expect(account.message.includes('Successfully Deleted')).toBeTruthy()
    })

    it('Should throw error when account not found', async () => {
      try {
        await controller.remove('123')
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.response).toHaveProperty('statusCode')
        expect(error.response.statusCode).toEqual(404)
        expect(error.response).toHaveProperty('message')
        expect(error.response.message.includes('Not Found')).toBeTruthy()
      }
    })
  })
})

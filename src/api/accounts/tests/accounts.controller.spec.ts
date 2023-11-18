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
      await repository.save(repository.create(generateFakeAccounts(14)))

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
      const account = await controller.findOne(newAccount.id)
      expect(account).toMatchObject(newAccount)
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
  })

  describe('Update', () => {
    it('should update a account', async () => {
      const newAccount = await repository.save(
        repository.create(generateFakeAccount()),
      )
      expect(newAccount).toHaveProperty('id')

      const account = await controller.update(newAccount.id, {
        balance: 100,
      })

      expect(account).toHaveProperty('message')
      expect(account.message.includes('Successfully Updated')).toBeTruthy()
    })

    it('Should throw error when account not found', async () => {
      try {
        await controller.update('123', {})
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

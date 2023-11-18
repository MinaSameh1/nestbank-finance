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
} from './accounts.test.helper'

describe('AccountsController', () => {
  let controller: AccountsController
  let repository: Repository<Account>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        AccountsService,
        {
          provide: DatabaseService,
          useValue: jest.fn(() => ({
            doInTransaction: jest.fn(),
          })),
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
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('Create', () => {
    it('should create a account', async () => {
      const account = await controller.create(generateFakeAccount())
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

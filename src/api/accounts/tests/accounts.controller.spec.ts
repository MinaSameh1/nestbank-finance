import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { DatabaseService, TestDatabaseModule } from 'src/common/db'
import { Account, User } from 'src/entities'
import { Repository } from 'typeorm'
import { AccountsController } from '../accounts.controller'
import { AccountsService } from '../accounts.service'
import {
  generateFakeAccount,
  generateFakeAccounts,
  setUpUserForUserId,
} from './accounts.test.helper'

describe('AccountsController', () => {
  let controller: AccountsController
  let repository: Repository<Account>
  let userRepository: Repository<User>
  let databaseService: DatabaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule.forRoot(),
        TypeOrmModule.forFeature([Account, User]),
      ],
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile()

    controller = module.get<AccountsController>(AccountsController)
    repository = module.get<Repository<Account>>(getRepositoryToken(Account))
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    databaseService = module.get<DatabaseService>(DatabaseService)
    // Reset database
    process.env.NODE_ENV = 'test'
    await databaseService.clearAll()
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
      const account = await controller.create(itemToBeSaved as any)
      expect(account).toHaveProperty('id')
      expect(account).toHaveProperty('created_at')
    })
  })

  describe('Find', () => {
    it('should return an array of accounts', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check

      const accounts = generateFakeAccounts(
        15,
        {
          userId: user.id,
        },
        true,
      )
      await repository.save(repository.create(accounts))

      const items = await controller.findAll({
        page: 0,
        limit: 5,
        skip: 0,
      })
      expect(items.items).toBeInstanceOf(Array)
      expect(items.items.length).toBeGreaterThanOrEqual(1)
      expect(items.items[0]).toHaveProperty('id')
      expect(items.total).toEqual(15)
      expect(items.pages).toEqual(3)
    })

    it('should return a account', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check
      const newAccount = await repository.save(
        repository.create(
          generateFakeAccount({
            userId: user.id,
          }),
        ),
      )
      expect(newAccount).toHaveProperty('id')

      const account = await controller.findOne(newAccount.id)
      expect(account).toMatchObject(newAccount)
      expect(account).toHaveProperty('user')
      expect(account.user).toHaveProperty('id')
    })

    it('Should throw error when account not found', async () => {
      try {
        await controller.findOne(randomUUID())
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
      const itemToBeSaved = generateFakeAccount({
        userId: user.id,
      } as any)

      const accounts: Partial<Account>[] = generateFakeAccounts(
        9,
        {
          user: {
            id: user.id,
            name: user.name,
            created_at: user.created_at,
          },
        },
        true,
      )

      accounts.push({
        ...itemToBeSaved,
        user: {
          id: user.id,
          name: user.name,
          created_at: user.created_at,
        } as any,
      })
      await repository.save(repository.create(accounts))
      delete itemToBeSaved.userId

      const items = await controller.findUsingUser(user.id, {
        limit: 10,
        page: 1,
        skip: 0,
      })

      expect(items.pages).toEqual(1)
      expect(items.total).toEqual(accounts.length)
      expect(items.items).toBeInstanceOf(Array)
      expect(items.items.length).toEqual(accounts.length)
      expect(items.items[accounts.length - 1]).toMatchObject({
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
        await controller.update(randomUUID(), {
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

      jest.spyOn(databaseService, 'doInTransaction')

      const item = await repository.save(repository.create(itemToBeSaved))
      delete itemToBeSaved.userId

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
        await controller.remove(randomUUID())
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

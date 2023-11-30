import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { ErrorCodes, ErrorMessages } from 'src/assets/strings'
import { DatabaseService, TestDatabaseModule } from 'src/common/db'
import { User } from 'src/entities'
import { Repository } from 'typeorm'
import { Account } from '../../../entities/account.entity'
import { AccountsService } from '../accounts.service'
import {
  generateFakeAccount,
  generateFakeAccounts,
  setUpUserForUserId,
} from './accounts.test.helper'

describe('AccountsService', () => {
  let service: AccountsService
  let repository: Repository<Account>
  let userRepository: Repository<User>
  let databaseService: DatabaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule.forRoot(),
        TypeOrmModule.forFeature([Account, User]),
      ],
      providers: [AccountsService],
    }).compile()

    service = module.get<AccountsService>(AccountsService)
    repository = module.get<Repository<Account>>(getRepositoryToken(Account))
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    databaseService = module.get<DatabaseService>(DatabaseService)
    // Reset database
    process.env.NODE_ENV = 'test'
    await databaseService.clearAll()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Find', () => {
    it('should return accounts', async () => {
      const user = await setUpUserForUserId(userRepository)

      const itemToBeSaved = generateFakeAccount(
        {
          userId: user.id,
        },
        true,
      )

      await repository.save(repository.create(itemToBeSaved))
      delete itemToBeSaved.userId

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

      const item = await service.create(itemToBeSaved as any, user.id)
      delete itemToBeSaved.userId

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
      const itemToBeSaved = generateFakeAccount(
        {
          userId: user.id,
        } as any,
        true,
      )

      const accounts = generateFakeAccounts(
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
        userId: user.id,
      })

      await repository.save(repository.create(accounts))

      delete itemToBeSaved.userId
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
        user: {
          id: user.id,
          name: user.name,
          created_at: user.created_at,
        },
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

      const item = await service.create(itemToBeSaved as any, user.id)
      delete itemToBeSaved.userId

      expect(item).toMatchObject({
        ...itemToBeSaved,
        user: { id: user.id },
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
        await service.create(itemToBeSaved as any, randomUUID())
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

      const item = await service.create(itemToBeSaved as any, user.id)
      delete itemToBeSaved.userId
      expect(item).toMatchObject({
        ...itemToBeSaved,
        user: { id: user.id },
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
      const id = randomUUID()
      try {
        await service.update(id, {} as any)
      } catch (err) {
        expect(err.message.includes('Successfully Updated')).toBeFalsy()
        expect(err).toBeInstanceOf(NotFoundException)
        expect(err.message).toEqual(ErrorMessages.NOT_FOUND_ID('account', id))
        expect(err.status).toEqual(404)
        expect(err.options.description).toEqual(ErrorCodes.NOT_FOUND)
      }
    })

    it('Should update status', async () => {
      const user = await setUpUserForUserId(userRepository)
      expect(user).toHaveProperty('id') // sanity check

      jest.spyOn(databaseService, 'doInTransaction')

      const itemToBeSaved = generateFakeAccount()

      const item = await service.create(itemToBeSaved as any, user.id)
      delete itemToBeSaved.userId

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
    })
  })

  it('Should delete account', async () => {
    const user = await setUpUserForUserId(userRepository)
    expect(user).toHaveProperty('id') // sanity check

    const itemToBeSaved = generateFakeAccount({
      userId: user.id,
    })
    const item = await repository.save(repository.create(itemToBeSaved))
    delete itemToBeSaved.userId
    expect(item).toHaveProperty('id')
    expect(item.deleted_at).toBeFalsy()

    const response = await service.remove(item.id)
    expect(response.message.includes('Successfully Deleted')).toBeTruthy()

    const deletedItem = await repository.findOne({
      where: {
        id: item.id,
      },
      withDeleted: true,
    })
    expect(deletedItem).toHaveProperty('id')
    expect(deletedItem?.deleted_at).toBeTruthy()
    try {
      await service.findOne(item.id)
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException)
      expect(err.message).toEqual(
        ErrorMessages.NOT_FOUND_ID('account', item.id),
      )
      expect(err.status).toEqual(404)
      expect(err.options.description).toEqual(ErrorCodes.NOT_FOUND)
    }
  })
})

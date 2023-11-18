import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { MockUserRepository } from 'src/api/users/tests/users.repository.mock'
import { DatabaseService } from 'src/common/db'
import { User } from 'src/entities'
import { Repository } from 'typeorm'
import { Account } from '../../../entities/account.entity'
import { AccountsService } from '../accounts.service'
import { MockAccountRepository } from './accounts.repository.mock'
import { generateFakeAccount, setUpUserForUserId } from './accounts.test.helper'

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
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return accounts', async () => {
    const itemToBeSaved = repository.create(await generateFakeAccount())
    await repository.save(itemToBeSaved)

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
  })

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

  it('Should update account', async () => {
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

    const itemToBeUpdated = generateFakeAccount()
    delete (itemToBeUpdated as any).userId
    const newItem = await service.update(item.id, itemToBeUpdated)
    expect(newItem.message.includes('Successfully Updated')).toBeTruthy()
  })

  it('Should get account', async () => {
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

    const oldItem = await service.findOne(item.id)
    expect(oldItem).toMatchObject(item)
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

    const oldItem = await service.remove(item.id)
    expect(oldItem.message.includes('Successfully Deleted')).toBeTruthy()
    const deletedItem = await service.findOne(item.id)
    expect(deletedItem?.deleted_at).toBeTruthy()
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

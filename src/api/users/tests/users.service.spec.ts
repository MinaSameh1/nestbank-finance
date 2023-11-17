import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../../entities/user.entity'
import { MockUserRepository } from '../users.repository.mock'
import { UsersService } from '../users.service'
import { generateFakeUser } from './user.test.helper'

describe('UsersService', () => {
  let service: UsersService
  let repository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: MockUserRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
    await repository.clear()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return items', async () => {
    const itemToBeSaved = repository.create(await generateFakeUser())
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

  it('should create item', async () => {
    const itemToBeSaved = await generateFakeUser()

    const item = await service.create(itemToBeSaved)

    expect(item.name).toEqual(itemToBeSaved.name)
    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('created_at')
  })

  it('Should update item', async () => {
    const itemToBeSaved = await generateFakeUser()

    const item = await service.create(itemToBeSaved)
    expect(item.name).toEqual(itemToBeSaved.name)
    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('created_at')

    const itemToBeUpdated = await generateFakeUser()
    const newItem = await service.update(item.id, itemToBeUpdated)
    expect(newItem.message.includes('Successfully Updated')).toBeTruthy()
  })

  it('Should get item', async () => {
    const itemToBeSaved = await generateFakeUser()
    const item = await service.create(itemToBeSaved)
    expect(item.name).toEqual(itemToBeSaved.name)
    expect(item).toHaveProperty('id')

    const oldItem = await service.findOne(item.id)
    expect(oldItem).toMatchObject(item)
  })

  it('Should delete item', async () => {
    const itemToBeSaved = await generateFakeUser()
    const item = await service.create(itemToBeSaved)
    expect(item.name).toEqual(itemToBeSaved.name)
    expect(item).toHaveProperty('id')

    const oldItem = await service.remove(item.id)
    expect(oldItem.message.includes('Successfully Deleted')).toBeTruthy()
    const deletedItem = await service.findOne(item.id)
    expect(deletedItem?.deleted_at).toBeTruthy()
  })
})

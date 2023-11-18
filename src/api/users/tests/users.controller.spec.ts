import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../../entities/user.entity'
import { UsersController } from '../users.controller'
import { UsersService } from '../users.service'
import { generateFakeUser, generateFakeUsers } from './user.test.helper'
import { MockUserRepository } from './users.repository.mock'

describe('UsersController', () => {
  let controller: UsersController
  let repository: Repository<User>
  let getManyAndCount: jest.Mock = jest.fn().mockReturnValue([[], 0])
  const createQueryBuilder = jest.fn(() => ({
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getManyAndCount,
  }))

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: MockUserRepository,
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
    await repository.clear()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('Create', () => {
    it('should create a user', async () => {
      const user = await controller.create(generateFakeUser())
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('created_at')
    })
  })

  describe('Find', () => {
    it('should return an array of users', async () => {
      const itemToBeSaved = generateFakeUser()
      const item = await repository.save(repository.create(itemToBeSaved))
      expect(item).toHaveProperty('id')
      const users = generateFakeUsers(14)
      await repository.save(repository.create(users))

      const returnValue = users.splice(0, 4).map(user => ({
        ...user,
        accounts: [] as any,
      }))

      returnValue.unshift({
        ...item,
        accounts: [
          {
            id: '021d7c4c-1a13-430a-b003-2146161ccd1b',
          },
        ],
      })
      getManyAndCount = jest.fn().mockReturnValue([returnValue, 15])
      repository.createQueryBuilder = createQueryBuilder as any
      const items = await controller.findAll({
        page: 1,
        limit: 5,
        skip: 0,
      })
      expect(items.items).toBeInstanceOf(Array)
      expect(items.items.length).toBeGreaterThanOrEqual(1)
      expect(items.items[0]).toMatchObject(item)
      expect(items.items[0]).toHaveProperty('accounts')
      expect(items.items[0].accounts.length).toBeGreaterThanOrEqual(1)
      expect(items.total).toEqual(15)
      expect(items.pages).toEqual(3)
    })

    it('should return a user', async () => {
      const newUser = await repository.save(
        repository.create(generateFakeUser()),
      )
      expect(newUser).toHaveProperty('id')
      const user = await controller.findOne(newUser.id)
      expect(user).toMatchObject(newUser)
    })

    it('Should throw error when user not found', async () => {
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
    it('should update a user', async () => {
      const newUser = await repository.save(
        repository.create(generateFakeUser()),
      )
      expect(newUser).toHaveProperty('id')

      const user = await controller.update(newUser.id, {
        name: 'updated name',
      })

      expect(user).toHaveProperty('message')
      expect(user.message.includes('Successfully Updated')).toBeTruthy()
    })

    it('Should throw error when user not found', async () => {
      const newUser = await repository.save(
        repository.create(generateFakeUser()),
      )
      expect(newUser).toHaveProperty('id')

      try {
        await controller.update('123', {
          name: 'updated name',
        })
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
    it('should delete a user', async () => {
      const newUser = await repository.save(
        repository.create(generateFakeUser()),
      )
      expect(newUser).toHaveProperty('id')

      const user = await controller.remove(newUser.id)

      expect(user).toHaveProperty('message')
      expect(user.message.includes('Successfully Deleted')).toBeTruthy()
    })

    it('Should throw error when user not found', async () => {
      const newUser = await repository.save(
        repository.create(generateFakeUser()),
      )
      expect(newUser).toHaveProperty('id')

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

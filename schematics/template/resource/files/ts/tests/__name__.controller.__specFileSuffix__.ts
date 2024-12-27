import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity'
import { <%= classify(name) %>Controller } from '../<%= name %>.controller';
import { Mock<%= singular(classify(name)) %>Repository } from './<%= lowercased(name) %>.repository.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { generateFake<%= singular(classify(name)) %>, generateFake<%= classify(name) %> } from './<%= name %>.test.helper'
import { Repository } from 'typeorm';
import { <%= classify(name) %>Service } from '../<%= name %>.service';

describe('<%= classify(name) %>Controller', () => {
  let controller: <%= classify(name) %>Controller
  let repository: Repository<<%= singular(classify(name)) %>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [<%= classify(name) %>Controller],
      providers: [
        <%= classify(name) %>Service,
        {
          provide: getRepositoryToken(<%= singular(classify(name)) %>),
          useClass: Mock<%= singular(classify(name)) %>Repository,
        },
      ],
    }).compile();

    controller = module.get<<%= classify(name) %>Controller>(<%= classify(name) %>Controller);
    repository = module.get<Repository<<%= singular(classify(name)) %>>>(getRepositoryToken(<%= singular(classify(name)) %>));
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  })

  describe('Create', () => {
    it('should create a <%= lowercased(singular(name)) %>', async () => {
      const <%= lowercased(singular(name)) %> = await controller.create(await generateFake<%= singular(classify(name)) %>())
      expect(<%= lowercased(singular(name)) %>).toHaveProperty('id')
      expect(<%= lowercased(singular(name)) %>).toHaveProperty('created_at')
    })
  })

  describe('Find', () => {
    it('should return an array of <%= lowercased(name) %>', async () => {
      const itemToBeSaved = await generateFake<%= singular(classify(name)) %>()
      const item = await repository.save(repository.create(itemToBeSaved))
      expect(item).toHaveProperty('id')
      await repository.save(repository.create(await generateFake<%= singular(classify(name)) %>s(14)))

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


    it('should return a <%= lowercased(singular(name)) %>', async () => {
      const new<%= singular(classify(name)) %> = await repository.save(
        repository.create(await generateFake<%= singular(classify(name)) %>()),
      )
      expect(new<%= singular(classify(name)) %>).toHaveProperty('id')
      const <%= lowercased(singular(name)) %> = await controller.findOne(new<%= singular(classify(name)) %>.id)
      expect(<%= lowercased(singular(name)) %>).toMatchObject(new<%= singular(classify(name)) %>)
    })

    it('Should throw error when <%= lowercased(singular(name)) %> not found', async () => {
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
    it('should update a <%= lowercased(singular(name)) %>', async () => {
      const new<%= singular(classify(name)) %> = await repository.save(
        repository.create(await generateFake<%= singular(classify(name)) %>()),
      )
      expect(new<%= singular(classify(name)) %>).toHaveProperty('id')

      const <%= lowercased(singular(name)) %> = await controller.update(new<%= singular(classify(name)) %>.id, {
        name: 'updated name',
      })

      expect(<%= lowercased(singular(name)) %>).toHaveProperty('message')
      expect(<%= lowercased(singular(name)) %>.message.includes('Successfully Updated')).toBeTruthy()
    })


    it('Should throw error when <%= lowercased(singular(name)) %> not found', async () => {
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
    it('should delete a <%= lowercased(singular(name)) %>', async () => {
      const new<%= singular(classify(name)) %> = await repository.save(
        repository.create(await generateFake<%= singular(classify(name)) %>()),
      )
      expect(new<%= singular(classify(name)) %>).toHaveProperty('id')

      const <%= lowercased(singular(name)) %> = await controller.remove(new<%= singular(classify(name)) %>.id)

      expect(<%= lowercased(singular(name)) %>).toHaveProperty('message')
      expect(<%= lowercased(singular(name)) %>.message.includes('Successfully Deleted')).toBeTruthy()
    })

    it('Should throw error when <%= lowercased(singular(name)) %> not found', async () => {
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
});

<%
// vim: ft=template
%>

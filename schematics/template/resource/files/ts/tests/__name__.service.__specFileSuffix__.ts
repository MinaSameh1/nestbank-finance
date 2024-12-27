import { Test, TestingModule } from '@nestjs/testing';
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity'
import { Repository } from 'typeorm';
import { Mock<%= singular(classify(name)) %>Repository } from './<%= lowercased(name) %>.repository.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { generateFake<%= singular(classify(name)) %> } from './<%= name %>.test.helper'
import { <%= classify(name) %>Service } from '../<%= name %>.service';

describe('<%= classify(name) %>Service', () => {
  let service: <%= classify(name) %>Service;
  let repository: Repository<<%= singular(classify(name)) %>>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<%= classify(name) %>Service,
      {
        provide: getRepositoryToken(<%= singular(classify(name)) %>),
        useClass: Mock<%= singular(classify(name)) %>Repository,
      },
      ],
    }).compile();

    service = module.get<<%= classify(name) %>Service>(<%= classify(name) %>Service);
    repository = module.get<Repository<<%= singular(classify(name)) %>>>(getRepositoryToken(<%= singular(classify(name)) %>));
    await repository.clear()
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return <%= lowercased(name) %>', async () => {
    const itemToBeSaved = repository.create(await generateFake<%= singular(classify(name)) %>())
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

  it('should create <%= lowercased(singular(name)) %>', async () => {
    const itemToBeSaved = await generateFake<%= singular(classify(name)) %>()

    const item = await service.create(itemToBeSaved)

    expect(item).toMatchObject({
      ...itemToBeSaved,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      deleted_at: null,
    })
    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('created_at')
  })

  it('Should update <%= lowercased(singular(name)) %>', async () => {
    const itemToBeSaved = await generateFake<%= singular(classify(name)) %>()

    const item = await service.create(itemToBeSaved)
    expect(item).toMatchObject({
      ...itemToBeSaved,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      deleted_at: null,
    })
    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('created_at')

    const itemToBeUpdated = await generateFake<%= singular(classify(name)) %>()
    const newItem = await service.update(item.id, itemToBeUpdated)
    expect(newItem.message.includes('Successfully Updated')).toBeTruthy()
  })

  it('Should get <%= lowercased(singular(name)) %>', async () => {
    const itemToBeSaved = await generateFake<%= singular(classify(name)) %>()
    const item = await service.create(itemToBeSaved)
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

  it('Should delete <%= lowercased(singular(name)) %>', async () => {
    const itemToBeSaved = await generateFake<%= singular(classify(name)) %>()
    const item = await service.create(itemToBeSaved)
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
});

<%
// vim: ft=template
%>

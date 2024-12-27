import { faker } from '@faker-js/faker'
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity';
import { Create<%= singular(classify(name)) %>Dto } from '../dto/create-<%= singular(name) %>.dto';

export const generateFake<%= singular(classify(name)) %> = (overrides?: Partial<<%= singular(classify(name)) %>>): Create<%= singular(classify(name)) %>Dto => {
  const name = faker.internet.userName() // placeholder
  return {
    ...overrides,
  }
}

export const generateFake<%= classify(name) %> = (count: number): Create<%= singular(classify(name)) %>Dto[] => {
  return faker.helpers.multiple(generateFake<%= singular(classify(name)) %>, { count })
}

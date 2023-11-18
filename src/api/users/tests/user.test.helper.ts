import { faker } from '@faker-js/faker'
import { CreateUserDto } from 'src/api/users/dto/create-user.dto'
import { User } from 'src/entities/user.entity'

export const generateFakeUser = (overrides?: Partial<User>): CreateUserDto => {
  return {
    name: faker.internet.userName(),
    ...overrides,
  }
}

export const generateFakeUsers = (count: number): CreateUserDto[] => {
  return faker.helpers.multiple(generateFakeUser, { count })
}

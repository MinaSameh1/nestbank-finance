import { faker } from '@faker-js/faker'
import { CreateUserDto } from 'src/api/users/dto/create-user.dto'
import { User } from 'src/entities/user.entity'

export const generateFakeUser = async (
  overrides?: Partial<User>,
): Promise<CreateUserDto> => {
  return {
    name: faker.internet.userName(),
    ...overrides,
  }
}

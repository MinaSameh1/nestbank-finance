import { faker } from '@faker-js/faker'
import { generateFakeUser } from 'src/api/users/tests/user.test.helper'
import { Account, AccountType } from 'src/entities'
import { CreateAccountDto } from '../dto/create-account.dto'

export const generateFakeAccount = (
  overrides?: Partial<Account>,
): CreateAccountDto => {
  return {
    balance: faker.number.int({ min: 0, max: 100000 }),
    type: faker.helpers.enumValue(AccountType),
    userId: faker.string.uuid(),
    ...overrides,
  }
}

export const generateFakeAccounts = (count: number): CreateAccountDto[] => {
  return faker.helpers.multiple(generateFakeAccount, { count })
}

export const setUpUserForUserId = async (userRepo: any) => {
  const user = userRepo.create(generateFakeUser())
  await userRepo.save(user)
  return user
}

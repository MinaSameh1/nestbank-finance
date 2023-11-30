import { faker } from '@faker-js/faker'
import { generateFakeUser } from 'src/api/users/tests/user.test.helper'
import { Account, AccountType } from 'src/entities'
import { CreateAccountDto } from '../dto/create-account.dto'

export const generateFakeAccount = (
  overrides?: Partial<CreateAccountDto | Account>,
  account_number?: boolean,
): Partial<CreateAccountDto> => {
  if (account_number) {
    return {
      account_number: Math.floor(Math.random() * 1000000000000).toString(),
      balance: faker.number.int({ min: 0, max: 100000 }),
      type: faker.helpers.enumValue(AccountType),
      active: faker.datatype.boolean(),
      ...overrides,
    } as any
  }
  return {
    balance: faker.number.int({ min: 0, max: 100000 }),
    type: faker.helpers.enumValue(AccountType),
    active: faker.datatype.boolean(),
    ...overrides,
  } as any
}

export const generateFakeAccounts = (
  count: number,
  overrides?: any,
  account_number?: boolean,
): Partial<CreateAccountDto>[] => {
  return faker.helpers.multiple(
    () => generateFakeAccount(overrides, account_number),
    { count },
  )
}

export const setUpUserForUserId = async (userRepo: any) => {
  const user = userRepo.create(generateFakeUser())
  await userRepo.save(user)
  return user
}

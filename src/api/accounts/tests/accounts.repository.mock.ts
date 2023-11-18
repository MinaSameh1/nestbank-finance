import { Account } from 'src/entities'
import { generateUUID } from 'src/utils/uuid'

export class MockAccountRepository {
  private accounts: Account[] = []

  async find({ take, skip }: any): Promise<Account[]> {
    return this.accounts.slice(skip, skip + take)
  }

  async findOne({
    where,
  }: {
    where: Record<string, string>
  }): Promise<Account | undefined> {
    return this.accounts.find(account => {
      return Object.keys(where).every(key => {
        return account[key] === where[key]
      })
    })
  }

  create(
    createAccountDto: any,
  ): typeof createAccountDto extends Array<infer item> ? item[] : Account {
    if (Array.isArray(createAccountDto)) {
      return createAccountDto.map(item => {
        return this.create(item)
      })
    }
    const account = Account.fromPartial(createAccountDto)
    return {
      ...account,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }
  }

  async save(
    account: Account | Account[],
  ): Promise<typeof account extends Account[] ? Account[] : Account> {
    if (Array.isArray(account)) {
      return account.map(item => {
        return this.save(item).then(newItem => newItem)
      }) as any
    }
    if (account.id) {
      const accountIndex = this.accounts.findIndex(
        item => item.id === account.id,
      )
      if (accountIndex > -1) {
        this.accounts[accountIndex] = {
          ...this.accounts[accountIndex],
          ...account,
        }
        return Promise.resolve(this.accounts[accountIndex])
      }
    }
    const index = this.accounts.push(account)
    return Promise.resolve(this.accounts[index - 1])
  }

  async insert(account: Account): Promise<{
    generatedMaps: Account[]
    raw: { account: Account }
  }> {
    await this.save(account)
    return { generatedMaps: [account], raw: { account } }
  }

  async update(
    filter: Record<string, string>,
    updateAccountDto: any,
  ): Promise<{ affected: number }> {
    const accountIndex = this.accounts.findIndex(account => {
      return Object.keys(filter).every(key => {
        return account[key] === filter[key]
      })
    })
    if (accountIndex > -1) {
      this.accounts.splice(accountIndex, 1, {
        ...this.accounts[accountIndex],
        ...updateAccountDto,
      })
      return { affected: 1 }
    }
    return { affected: 0 }
  }

  async delete(id: string): Promise<void> {
    this.accounts = this.accounts.filter(account => account.id !== id)
  }

  async count(filter: any): Promise<number> {
    if (filter) {
      return this.accounts.filter(account => {
        return Object.keys(filter).every(key => {
          return account[key] === filter[key]
        })
      }).length
    }

    return this.accounts.length
  }

  async softDelete(
    filter: Record<string, string>,
  ): Promise<{ affected: number }> {
    const index = this.accounts.findIndex(Account => {
      return Object.keys(filter).every(key => {
        return Account[key] === filter[key]
      })
    })
    if (index > -1) {
      this.accounts[index] = {
        ...this.accounts[index],
        deleted_at: new Date(),
      }
      return { affected: 1 }
    }
    return { affected: 0 }
  }

  clear(): void {
    this.accounts = []
  }

  private generateId(): string {
    return generateUUID()
  }
}

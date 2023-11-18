import { User } from 'src/entities'
import { generateUUID } from 'src/utils/uuid'

export class MockUserRepository {
  private users: User[] = []

  async find({ take, skip }: any): Promise<User[]> {
    return this.users.slice(skip, skip + take)
  }

  async findOne({
    where,
  }: {
    where: Record<string, string>
  }): Promise<User | undefined> {
    return this.users.find(user => {
      return Object.keys(where).every(key => {
        return user[key] === where[key]
      })
    })
  }

  create(
    createuserDto: any,
  ): typeof createuserDto extends Array<infer item> ? item[] : User {
    if (Array.isArray(createuserDto)) {
      return createuserDto.map(user => {
        return this.create(user)
      })
    }
    const user = User.fromPartial(createuserDto)
    return {
      ...user,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }
  }

  async save(
    user: User | User[],
  ): Promise<typeof user extends User[] ? User[] : User> {
    if (Array.isArray(user)) {
      return user.map(item => {
        return this.save(item).then(newItem => newItem)
      }) as any
    }
    if (user.id) {
      const userIndex = this.users.findIndex(u => u.id === user.id)
      if (userIndex > -1) {
        this.users[userIndex] = {
          ...this.users[userIndex],
          ...user,
        }
        return Promise.resolve(this.users[userIndex])
      }
    }
    const index = this.users.push(user)
    return Promise.resolve(this.users[index - 1])
  }

  async insert(user: User): Promise<{
    generatedMaps: User[]
    raw: any
  }> {
    // mock
    const newUser = await this.save(user)
    return { generatedMaps: [newUser], raw: { newUser } }
  }

  async update(
    filter: Record<string, string>,
    updateUserDto: any,
  ): Promise<{ affected: number }> {
    const userIndex = this.users.findIndex(user => {
      return Object.keys(filter).every(key => {
        return user[key] === filter[key]
      })
    })
    if (userIndex > -1) {
      this.users.splice(userIndex, 1, {
        ...this.users[userIndex],
        ...updateUserDto,
      })
      return { affected: 1 }
    }
    return { affected: 0 }
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== id)
  }

  async count(filter: any): Promise<number> {
    if (filter) {
      return this.users.filter(user => {
        return Object.keys(filter).every(key => {
          return user[key] === filter[key]
        })
      }).length
    }

    return this.users.length
  }

  async softDelete(filter: any): Promise<{ affected: number }> {
    const userIndex = this.users.findIndex(user => {
      return Object.keys(filter).every(key => {
        return user[key] === filter[key]
      })
    })
    if (userIndex > -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        deleted_at: new Date(),
      }
      return { affected: 1 }
    }
    return { affected: 0 }
  }

  clear(): void {
    this.users = []
  }

  createQueryBuilder(): any {
    return this
  }
  skip(): any {
    return this
  }
  take(): any {}
  leftJoin() {
    return this
  }
  select() {
    return this
  }
  getMany() {
    return []
  }

  private generateId(): string {
    return generateUUID()
  }
}

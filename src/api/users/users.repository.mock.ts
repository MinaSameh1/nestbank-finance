import { generateUUID } from 'src/utils/uuid'
import { User } from '../../entities/user.entity'
export class MockUserRepository {
  private users: User[] = []

  async find({ take, skip }: any): Promise<User[]> {
    return this.users.slice(skip, skip + take)
  }

  async findOne(
    { where }: { where: Record<string, string> },
  ): Promise<User | undefined> {
    return this.users.find(user => {
      return Object.keys(where).every(key => {
        return user[key] === where[key]
      })
    })
  }

  create(createuserDto: any): User {
    const user = User.fromPartial(createuserDto)
    return {
      ...user,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }
  }

  async save(user: User): Promise<User> {
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

  private generateId(): string {
    return generateUUID()
  }
}

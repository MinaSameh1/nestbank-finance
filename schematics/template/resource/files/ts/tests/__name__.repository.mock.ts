import { generateUUID } from 'src/utils/uuid'
import { <%= singular(classify(name)) %> } from '../entities/<%= singular(name) %>.entity';

export class Mock<%= singular(classify(name)) %>Repository {
  private <%= lowercased(classify(name)) %>: <%= singular(classify(name)) %>[] = [];

  async find({ take, skip }: any): Promise<<%= singular(classify(name)) %>[]> {
    return this.<%= lowercased(classify(name)) %>.slice(skip, skip + take);
  }

  async findOne({
    where,
  }: {
    where: Record<string, string>
  }): Promise<<%= singular(classify(name)) %> | undefined> {
    return this.<%= lowercased(classify(name)) %>.find(<%= lowercased(singular(classify(name))) %> => {
      return Object.keys(where).every(key => {
        return <%= lowercased(singular(classify(name))) %>[key] === where[key]
      })
    })
  }

  create(
    create<%= singular(classify(name)) %>Dto: any
  ): typeof create<%= singular(classify(name)) %>Dto extends Array<infer item> ? item[] : <%= singular(classify(name)) %> {
    if (Array.isArray(create<%= singular(classify(name)) %>Dto)) {
      return create<%= singular(classify(name)) %>Dto.map(item => {
        return this.create(item)
      })
    }
    const <%= lowercased(singular(classify(name))) %> = <%= singular(classify(name)) %>.fromPartial(create<%= singular(classify(name)) %>Dto)
    return {
      ...<%= lowercased(singular(classify(name))) %>,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };
  }

  async save(
    <%= lowercased(singular(classify(name))) %>: <%= singular(classify(name)) %> | <%= singular(classify(name)) %>[],
  ): Promise<typeof <%= lowercased(singular(name)) %> extends <%= singular(classify(name)) %>[] ? <%= singular(classify(name)) %>[] : <%= singular(classify(name)) %>> {
    if (Array.isArray(<%= lowercased(singular(classify(name))) %>)) {
      return <%= lowercased(singular(name)) %>.map(item => {
        return this.save(item).then(newItem => newItem)
      }) as any
    }
    if (<%= lowercased(singular(classify(name))) %>.id) {
      const <%= lowercased(singular(name)) %>Index = this.<%= lowercased(classify(name)) %>.findIndex(item => item.id === <%= lowercased(singular(classify(name))) %>.id)
      if (<%= lowercased(singular(name)) %>Index > -1) {
        this.<%= lowercased(classify(name)) %>[<%= lowercased(singular(name)) %>Index] = {
          ...this.<%= lowercased(classify(name)) %>[<%= lowercased(singular(name)) %>Index],
          ...<%= lowercased(singular(name)) %>,
        }
        return Promise.resolve(this.<%= lowercased(classify(name)) %>[<%= lowercased(singular(name)) %>Index])
      }
    }
    const index = this.<%= lowercased(classify(name)) %>.push(<%= lowercased(singular(classify(name))) %>);
    return Promise.resolve(this.<%= lowercased(classify(name)) %>[index - 1])
  }

  async insert(<%= lowercased(singular(classify(name))) %>: <%= singular(classify(name)) %>): Promise<{
    generatedMaps: <%= singular(classify(name)) %>[]
    raw: { <%= lowercased(singular(classify(name))) %>: <%= singular(classify(name)) %> }
  }> {
    await this.save(<%= lowercased(singular(classify(name))) %>)
    return { generatedMaps: [<%= lowercased(singular(classify(name))) %>], raw: { <%= lowercased(singular(classify(name))) %> } }
  }


  async update(
    filter: Record<string, string>,
    update<%= singular(classify(name)) %>Dto: any,
  ): Promise<{ affected: number }> {
    const <%= lowercased(singular(name)) %>Index = this.<%= lowercased(classify(name)) %>.findIndex(<%= lowercased(singular(classify(name))) %> => {
        return Object.keys(filter).every(key => {
          return <%= lowercased(singular(classify(name))) %>[key] === filter[key]
        })
      })
    if (<%= lowercased(singular(classify(name))) %>Index > -1) {
      this.<%= lowercased(classify(name)) %>.splice(<%= lowercased(singular(name)) %>Index, 1, {
        ...this.<%= lowercased(classify(name)) %>[<%= lowercased(singular(name)) %>Index],
        ...update<%= singular(classify(name)) %>Dto,
      })
      return { affected: 1 }
    }
    return { affected: 0 }
  }


  async delete(id: string): Promise<void> {
    this.<%= lowercased(classify(name)) %> = this.<%= lowercased(classify(name)) %>.filter(<%= lowercased(singular(classify(name))) %> => <%= lowercased(singular(classify(name))) %>.id !== id);
  }

  async count(filter: any): Promise<number> {
    if (filter) {
      return this.<%= lowercased(classify(name)) %>.filter(<%= lowercased(singular(classify(name))) %> => {
        return Object.keys(filter).every(key => {
          return <%= lowercased(singular(classify(name))) %>[key] === filter[key]
        })
      }).length
    }

    return this.<%= lowercased(classify(name)) %>.length
  }

  async softDelete(filter: Record<string, string>): Promise<{ affected: number }> {
    const index = this.<%= lowercased(classify(name)) %>.findIndex(<%= singular(classify(name)) %> => {
      return Object.keys(filter).every(key => {
        return <%= singular(classify(name)) %>[key] === filter[key]
      })
    })
    if (index > -1) {
      this.<%= lowercased(classify(name)) %>[index] = {
        ...this.<%= lowercased(classify(name)) %>[index],
        deleted_at: new Date(),
      }
      return { affected: 1 };
    }
    return { affected: 0 };
  }

  clear(): void {
    this.<%= lowercased(classify(name)) %> = [];
  }

  private generateId(): string {
    return generateUUID();
  }
}

<%
// vim: ft=template 
%>

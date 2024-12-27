<% if (type === 'graphql-code-first') { %>import { ObjectType, Field, Int } from '@nestjs/graphql';
@ObjectType()
export class <%= singular(classify(name)) %> {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}<% } else { %>import { AbstractEntity } from 'src/common/db'
import { DeepPartial, Entity } from 'typeorm'

@Entity()
export class <%= singular(classify(name)) %> extends AbstractEntity {
  static fromPartial(data: DeepPartial<<%= singular(classify(name)) %>>): <%= singular(classify(name)) %> {
    return Object.assign(new <%= singular(classify(name)) %>(), data)
  }
}<% } %>
<% // vim: ft=template %>

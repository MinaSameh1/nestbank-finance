import { Injectable, Logger, NotFoundException } from '@nestjs/common'; <% if (crud && type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCodes, ErrorMessages, SuccessMessages } from 'src/assets/strings'
import { ID } from 'src/common/db';
import { Pagination, PaginatedDto } from 'src/common/types';
import { Repository } from 'typeorm';
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } else if (crud) { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';

@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  private readonly logger = new Logger(<%= classify(name) %>Service.name);

  @InjectRepository(<%= singular(classify(name)) %>) private readonly <%= lowercased(classify(name)) %>Repository: Repository<<%= singular(classify(name)) %>>;

  async create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>) {
    this.logger.debug('Creating a new <%= singular(name) %>');
    const <%= lowercased(singular(name)) %> = this.<%= lowercased(classify(name)) %>Repository.create(create<%= singular(classify(name)) %>Dto)
    await this.<%= lowercased(classify(name)) %>Repository.insert(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %> <%= lowercased(singular(name)) %><% } else { %>create<%= singular(classify(name)) %>Input<% } %>);
    return <%= lowercased(singular(name)) %>
  }

  async findAll(pagination: Pagination): Promise<PaginatedDto<<%= singular(classify(name)) %>>> {
    this.logger.debug('Finding all <%= lowercased(name) %>s');
    const [items, total] = await Promise.all([
      this.<%= lowercased(classify(name)) %>Repository.find({
        order: { created_at: 'DESC' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.<%= lowercased(classify(name)) %>Repository.count()
    ])

    return {
      total,
      pages: Math.ceil(total / pagination.limit),
      items,
    }
  }

  async findOne(id: ID) {
    this.logger.debug(`Finding <%= singular(name) %> with id: ${id}`);
    const <%= lowercased(singular(name)) %> = await this.<%= lowercased(classify(name)) %>Repository.findOne({ where: { id } });
    if (!<%= lowercased(singular(name)) %>) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('<%= lowercased(singular(name)) %>', id), {
        description: ErrorCodes.NOT_FOUND,
      });
    }
    return <%= lowercased(singular(name)) %>;
  }

  async update(id: ID, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>) {
    this.logger.debug(`Updating <%= singular(name) %> with id: ${id}`);
    const <%= lowercased(singular(name)) %>Exists = await this.<%= lowercased(classify(name)) %>Repository.update({ id }, update<%= singular(classify(name)) %>Dto)
    if (!(<%= lowercased(singular(name)) %>Exists.affected === 1)) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('<%= lowercased(singular(name)) %>', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_UPDATED_ID('<%= lowercased(singular(name)) %>', id),
    }
  }

  async remove(id: ID) {
    this.logger.debug(`Removing <%= lowercased(singular(name)) %> with id: ${id}`)
    const deleteResult = await this.<%= lowercased(classify(name)) %>Repository.softDelete({ id })
    if (!(deleteResult.affected === 1)) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_ID('<%= lowercased(singular(name)) %>', id), {
        description: ErrorCodes.NOT_FOUND,
      })
    }
    return {
      message: SuccessMessages.SUCCESSFULLY_DELETED_ID('<%= lowercased(singular(name)) %>', id),
    }
  }


<% } %>}

<%
// vim: ft=template
%>

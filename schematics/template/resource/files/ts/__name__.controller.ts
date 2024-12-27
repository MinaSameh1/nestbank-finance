<% if (crud && type === 'rest') { %>import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import {
  IdParam,
  Paginate,
  SwaggerDocumentation,
  SwaggerDocumentationPaginationQuery,
} from 'src/common/decorators';
import { Pagination, PaginatedDto } from 'src/common/types';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger'<%
} else if (crud && type === 'microservice') { %>import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';<%
} else { %>import { Controller } from '@nestjs/common';<%
} %>
import { <%= classify(name) %>Service } from './<%= name %>.service';<% if (crud) { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } %>
import { ID } from 'src/common/db';
import { <%= singular(classify(name)) %> } from './entities/<%= singular(name) %>.entity';

<% if (type === 'rest') { %>
@ApiTags('<%= dasherize(name) %>')
@Controller('<%= dasherize(name) %>')
  <% } else { %>@Controller()<% } %>
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (type === 'rest' && crud) { %>

  @SwaggerDocumentation({
    summary: 'Create <%= singular(lowercased(name)) %>',
    badRequestDescription: 'Invalid Data',
    okDescription: '<%= singular(lowercased(name)) %> created',
    status: HttpStatus.CREATED,
    okType: <%= singular(classify(name)) %>,
  })
  @ApiBody({ type: Create<%= singular(classify(name)) %>Dto })
  @Post()
  create(@Body() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @SwaggerDocumentation({
    summary: 'Find all <%= lowercased(name) %>',
    okDescription: 'Return all <%= lowercased(name) %>',
    badRequestDescription: 'Invalid pagination query',
    paginated: true,
    okType: <%= singular(classify(name)) %>
  })
  @SwaggerDocumentationPaginationQuery()
  @Get()
  findAll(@Paginate() pagination: Pagination): Promise<PaginatedDto<<%= singular(classify(name)) %>>> {
    return this.<%= lowercased(name) %>Service.findAll(pagination);
  }

  @SwaggerDocumentation({
    summary: 'Find one <%= singular(name) %>',
    okDescription: 'Return one <%= singular(name) %>',
    badRequestDescription: 'Invalid <%= singular(name) %> id',
    okType: <%= singular(classify(name)) %>,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true
  })
  @Get(':id')
  findOne(@IdParam('id') id: ID) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @SwaggerDocumentation({
    summary: 'Update one <%= singular(name) %>',
    okDescription: 'Return updated <%= singular(name) %>',
    badRequestDescription: 'Invalid <%= singular(name) %> id',
    okType: <%= singular(classify(name)) %>,
  })
  @ApiBody({ type: Update<%= singular(classify(name)) %>Dto })
  @ApiParam({
    name: 'id',
    type: String,
    required: true
  })
  @Patch(':id')
  update(@IdParam('id') id: ID, @Body() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(id, update<%= singular(classify(name)) %>Dto);
  }

  @SwaggerDocumentation({
    summary: 'Remove one <%= singular(name) %>',
    okDescription: 'Return removed <%= singular(name) %>',
    badRequestDescription: 'Invalid <%= singular(name) %> id',
    okType: <%= singular(classify(name)) %>,
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true
  })
  @Delete(':id')
  remove(@IdParam('id') id: ID) {
    return this.<%= lowercased(name) %>Service.remove(id);
  }<% } else if (type === 'microservice' && crud) { %>

  @MessagePattern('create<%= singular(classify(name)) %>')
  create(@Payload() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @MessagePattern('findAll<%= classify(name) %>')
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @MessagePattern('findOne<%= singular(classify(name)) %>')
  findOne(@Payload() id: number) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @MessagePattern('update<%= singular(classify(name)) %>')
  update(@Payload() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>Dto.id, update<%= singular(classify(name)) %>Dto);
  }

  @MessagePattern('remove<%= singular(classify(name)) %>')
  remove(@Payload() id: number) {
    return this.<%= lowercased(name) %>Service.remove(id);
  }<% } %>
}

<%
// vim: ft=template
%>
